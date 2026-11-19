// Voxel world — draws cubes (lit faces), quads (flat color), text boards (textures) and a floor dot grid on one canvas. Does not use the original engine, rebuilt with the same camera, light and motion values.
(() => {
  const { mat4, vec3 } = glMatrix;
  const RAD = Math.PI / 180;

  // Skin color as three 0–1 values for the GPU — the canvas resolves values that need calculation, like color-mix
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgb = (name, fallback = "transparent") => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
    probe.fillStyle = fallback;
    probe.fillStyle = v;
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  // Curve — reads the same value as CSS cubic-bezier on every frame
  const bezier = (x1, y1, x2, y2) => {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (t) => ((ax * t + bx) * t + cx) * t, sy = (t) => ((ay * t + by) * t + cy) * t, dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 8; i++) { const e = sx(t) - x, d = dx(t); if (Math.abs(e) < 1e-5 || !d) break; t -= e / d; }
      return sy(Math.min(1, Math.max(0, t)));
    };
  };

  const VS_CUBE = `
    attribute vec3 vertex; attribute vec3 color; attribute float lit;
    attribute vec4 m0; attribute vec4 m1; attribute vec4 m2; attribute vec4 m3;
    uniform mat4 vp; varying vec3 vPos; varying vec3 vColor; varying float vLit;
    void main(){ mat4 m = mat4(m0, m1, m2, m3); vec4 w = m * vec4(vertex, 1.); vPos = w.xyz; vColor = color; vLit = lit; gl_Position = vp * w; }`;
  // Get each face’s slope from screen derivatives and paint every face one color — half light + half how much it faces the light
  const FS_CUBE = `
    #extension GL_OES_standard_derivatives : enable
    precision highp float; varying vec3 vPos; varying vec3 vColor; varying float vLit; uniform vec3 light;
    void main(){
      vec3 n = normalize(cross(dFdx(vPos), dFdy(vPos)));
      float b = mix(1., .5 + .5 * dot(n, normalize(light)), vLit);
      gl_FragColor = vec4(vColor * b, 1.);
    }`;
  const VS_QUAD = `
    attribute vec3 vertex; attribute vec2 uv; uniform mat4 mvp; uniform vec2 rep; varying vec2 vUv;
    void main(){ vUv = uv * rep; gl_Position = mvp * vec4(vertex, 1.); }`;
  const FS_QUAD = `
    precision highp float; uniform sampler2D tex; uniform float alpha; varying vec2 vUv;
    void main(){ vec4 c = texture2D(tex, vUv); gl_FragColor = vec4(c.rgb, c.a * alpha); }`;

  // Cube: side length 1, centered on the origin
  const CUBE_V = new Float32Array([-.5,-.5,-.5, .5,-.5,-.5, -.5,.5,-.5, .5,.5,-.5, -.5,-.5,.5, .5,-.5,.5, -.5,.5,.5, .5,.5,.5]);
  const CUBE_I = new Uint16Array([0,2,1, 1,2,3, 4,5,6, 6,5,7, 0,1,4, 4,1,5, 2,6,3, 3,6,7, 0,4,2, 2,4,6, 1,3,5, 5,3,7]);
  const QUAD_V = new Float32Array([0,0,0, 1,0,0, 0,-1,0, 1,-1,0]);
  const QUAD_UV = new Float32Array([0,0, 1,0, 0,1, 1,1]);
  const STRIDE = 20;

  class Batch {
    constructor(gl, ext, cap) { this.gl = gl; this.ext = ext; this.cap = cap; this.data = new Float32Array(cap * STRIDE); this.count = 0; this.buf = gl.createBuffer(); this.dirty = true; }
    grow(n) { if (n <= this.cap) return; const d = new Float32Array(n * STRIDE); d.set(this.data); this.data = d; this.cap = n; }
    put(i, color, m, lit = 1) { const o = i * STRIDE, d = this.data; d[o] = color[0]; d[o + 1] = color[1]; d[o + 2] = color[2]; d[o + 3] = lit; d.set(m, o + 4); }
    setColor(i, c) { const o = i * STRIDE; this.data[o] = c[0]; this.data[o + 1] = c[1]; this.data[o + 2] = c[2]; this.dirty = true; }
    upload() { const gl = this.gl; gl.bindBuffer(gl.ARRAY_BUFFER, this.buf); gl.bufferData(gl.ARRAY_BUFFER, this.data.subarray(0, Math.max(1, this.count) * STRIDE), gl.DYNAMIC_DRAW); this.dirty = false; }
  }

  class World {
    constructor(canvas) {
      this.canvas = canvas;
      const gl = (this.gl = canvas.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: false }));
      if (!gl) throw new Error("webgl");
      this.inst = gl.getExtension("ANGLE_instanced_arrays");
      gl.getExtension("OES_standard_derivatives");
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
      // Shaders are precompiled when the world is built — compiling on the first cursor move would freeze the screen
      this.cubeProg = this.program(VS_CUBE, FS_CUBE);
      this.quadProg = this.program(VS_QUAD, FS_QUAD);
      this.cubeVbo = this.buffer(CUBE_V); this.cubeIbo = this.buffer(CUBE_I, gl.ELEMENT_ARRAY_BUFFER);
      this.quadVbo = this.buffer(QUAD_V); this.quadUv = this.buffer(QUAD_UV);
      this.cam = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, dist: 200, focal: 200 };
      this.light = [-0.098, -0.195, 0.976];
      this.vp = mat4.create(); this.v = mat4.create(); this.p = mat4.create();
      this.batches = [];
      this.planes = [];
      this.W = 1; this.H = 1;
    }
    program(vs, fs) {
      const gl = this.gl, p = gl.createProgram();
      for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
        const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        gl.attachShader(p, s);
      }
      gl.linkProgram(p);
      const loc = {};
      const n = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES);
      for (let i = 0; i < n; i++) { const a = gl.getActiveAttrib(p, i); loc[a.name] = gl.getAttribLocation(p, a.name); }
      const u = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < u; i++) { const a = gl.getActiveUniform(p, i); loc[a.name] = gl.getUniformLocation(p, a.name); }
      return { p, loc };
    }
    buffer(data, target = this.gl.ARRAY_BUFFER) { const gl = this.gl, b = gl.createBuffer(); gl.bindBuffer(target, b); gl.bufferData(target, data, gl.STATIC_DRAW); return b; }
    batch(cap) { const b = new Batch(this.gl, this.inst, cap); this.batches.push(b); return b; }
    texture(canvas, repeat = false) {
      const gl = this.gl, t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
      const wrap = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, repeat ? gl.NEAREST : gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, repeat ? gl.NEAREST : gl.LINEAR);
      return t;
    }
    // Text plate and dot grid: positions in screen px (x, y follow the DOM direction, z goes up from the floor)
    plane(tex, x, y, w, h, opts = {}) { const pl = { tex, x, y, w, h, z: opts.z || 0, rep: opts.rep || [1, 1], alpha: opts.alpha ?? 1, rotX: opts.rotX || 0, show: true }; this.planes.push(pl); return pl; }
    resize(W, H, ratio) {
      this.W = W; this.H = H;
      this.canvas.width = Math.round(W * ratio); this.canvas.height = Math.round(H * ratio);
      this.canvas.style.width = W + "px"; this.canvas.style.height = H + "px";
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    // Same camera as the original: view the origin from distance dist, rotated about the X, Y and Z axes, with 1px at focal length focal = Viewing angle that becomes 1px
    updateCamera() {
      const c = this.cam, o = [0, 0, 0];
      const eye = vec3.fromValues(0, 0, c.dist), up = vec3.fromValues(0, 1, 0);
      for (const [fn, a] of [[vec3.rotateX, c.rx], [vec3.rotateY, c.ry], [vec3.rotateZ, c.rz]]) { fn(eye, eye, o, a * RAD); fn(up, up, o, a * RAD); }
      mat4.lookAt(this.v, eye, o, up);
      mat4.translate(this.v, this.v, [-c.x, c.y, -c.z]);
      const near = Math.max(1, c.dist * 0.1), far = c.dist * 2 + 6000;
      mat4.perspective(this.p, 2 * Math.atan(this.H / (2 * c.focal)), this.W / this.H, near, far);
      mat4.multiply(this.vp, this.p, this.v);
    }
    render() {
      const gl = this.gl, ext = this.inst;
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      // Floor panel (dot grid, text board)
      const q = this.quadProg; gl.useProgram(q.p);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVbo); gl.enableVertexAttribArray(q.loc.vertex); gl.vertexAttribPointer(q.loc.vertex, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.quadUv); gl.enableVertexAttribArray(q.loc.uv); gl.vertexAttribPointer(q.loc.uv, 2, gl.FLOAT, false, 0, 0);
      const m = mat4.create(), mvp = mat4.create();
      gl.depthMask(false);
      for (const pl of this.planes) {
        if (!pl.show || pl.alpha <= 0) continue;
        mat4.fromTranslation(m, [pl.x, -pl.y, pl.z]);
        if (pl.rotX) mat4.rotateX(m, m, pl.rotX);
        mat4.scale(m, m, [pl.w, pl.h, 1]);
        mat4.multiply(mvp, this.vp, m);
        gl.uniformMatrix4fv(q.loc.mvp, false, mvp);
        gl.uniform2fv(q.loc.rep, pl.rep);
        gl.uniform1f(q.loc.alpha, pl.alpha);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, pl.tex); gl.uniform1i(q.loc.tex, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      gl.depthMask(true);
      gl.disableVertexAttribArray(q.loc.uv);
      // Cube · square
      const c = this.cubeProg; gl.useProgram(c.p);
      gl.uniformMatrix4fv(c.loc.vp, false, this.vp);
      gl.uniform3fv(c.loc.light, this.light);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVbo); gl.enableVertexAttribArray(c.loc.vertex); gl.vertexAttribPointer(c.loc.vertex, 3, gl.FLOAT, false, 0, 0);
      ext.vertexAttribDivisorANGLE(c.loc.vertex, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeIbo);
      const attrs = [["color", 3, 0], ["lit", 1, 3], ["m0", 4, 4], ["m1", 4, 8], ["m2", 4, 12], ["m3", 4, 16]];
      for (const b of this.batches) {
        if (!b.count || b.hidden) continue;
        if (b.dirty) b.upload(); else gl.bindBuffer(gl.ARRAY_BUFFER, b.buf);
        for (const [name, size, off] of attrs) {
          const l = c.loc[name]; gl.enableVertexAttribArray(l);
          gl.vertexAttribPointer(l, size, gl.FLOAT, false, STRIDE * 4, off * 4);
          ext.vertexAttribDivisorANGLE(l, 1);
        }
        ext.drawElementsInstancedANGLE(gl.TRIANGLES, CUBE_I.length, gl.UNSIGNED_SHORT, 0, b.count);
      }
      for (const [name] of attrs) { ext.vertexAttribDivisorANGLE(c.loc[name], 0); gl.disableVertexAttribArray(c.loc[name]); }
    }
  }

  // Shape matrix of one cube — DOM position (x, y: top-left cell corner), size s, z from the floor (top face height)
  const cubeAt = (out, x, y, s, z = s, d = s) => { mat4.fromTranslation(out, [x + s / 2, -(y + s / 2), z - d / 2]); mat4.scale(out, out, [s, s, d]); return out; };

  window.YnWorld = { World, cubeAt, rgb, bezier, mat4 };
})();
