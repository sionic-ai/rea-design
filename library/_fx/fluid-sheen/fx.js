// Waving the mouse over the attached panel spreads the panel’s text-color light like water and settles in a little over 1 second — WebGL2 stable fluids (vortex · pressure projection) written as our own shader
(() => {
  const VS = `#version 300 es
in vec2 p; out vec2 uv, l, r, t, b; uniform vec2 px;
void main(){ uv = p * .5 + .5; l = uv - vec2(px.x, 0.); r = uv + vec2(px.x, 0.); t = uv + vec2(0., px.y); b = uv - vec2(0., px.y); gl_Position = vec4(p, 0., 1.); }`;
  const HEAD = "#version 300 es\nprecision highp float; precision highp sampler2D; in vec2 uv, l, r, t, b; out vec4 o; uniform vec2 px;\n";
  const FS = {
    copy: "uniform sampler2D a; uniform float k; void main(){ o = k * texture(a, uv); }",
    splat: "uniform sampler2D a; uniform float aspect, rad; uniform vec2 at; uniform vec3 c; void main(){ vec2 d = uv - at; d.x *= aspect; o = vec4(texture(a, uv).xyz + exp(-dot(d, d) / rad) * c, 1.); }",
    advect: "uniform sampler2D v, s; uniform float dt, diss; void main(){ vec2 q = uv - dt * texture(v, uv).xy * px; o = texture(s, q) / (1. + diss * dt); o.a = 1.; }",
    div: "uniform sampler2D v; void main(){ float L = texture(v, l).x, R = texture(v, r).x, T = texture(v, t).y, B = texture(v, b).y; vec2 c = texture(v, uv).xy; if (l.x < 0.) L = -c.x; if (r.x > 1.) R = -c.x; if (t.y > 1.) T = -c.y; if (b.y < 0.) B = -c.y; o = vec4(.5 * (R - L + T - B), 0., 0., 1.); }",
    curl: "uniform sampler2D v; void main(){ o = vec4(.5 * (texture(v, r).y - texture(v, l).y - texture(v, t).x + texture(v, b).x), 0., 0., 1.); }",
    vort: "uniform sampler2D v, w; uniform float k, dt; void main(){ float L = texture(w, l).x, R = texture(w, r).x, T = texture(w, t).x, B = texture(w, b).x, C = texture(w, uv).x; vec2 f = .5 * vec2(abs(T) - abs(B), abs(R) - abs(L)); f /= length(f) + .0001; f *= k * C; f.y *= -1.; o = vec4(clamp(texture(v, uv).xy + f * dt, -1000., 1000.), 0., 1.); }",
    press: "uniform sampler2D p, d; void main(){ o = vec4((texture(p, l).x + texture(p, r).x + texture(p, b).x + texture(p, t).x - texture(d, uv).x) * .25, 0., 0., 1.); }",
    grad: "uniform sampler2D p, v; void main(){ o = vec4(texture(v, uv).xy - vec2(texture(p, r).x - texture(p, l).x, texture(p, t).x - texture(p, b).x), 0., 1.); }",
    show: "uniform sampler2D a; uniform vec3 tint; uniform float alpha; void main(){ vec3 c = texture(a, uv).rgb; float dx = length(texture(a, r).rgb) - length(texture(a, l).rgb), dy = length(texture(a, t).rgb) - length(texture(a, b).rgb); vec3 n = normalize(vec3(dx, dy, length(px))); c *= clamp(n.z + .7, .7, 1.); float al = smoothstep(.015, .42, max(c.r, max(c.g, c.b))) * alpha; o = vec4(tint * al, al); }",
  };

  kfFx.register("fluid-sheen", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const canvas = document.createElement("canvas");
    canvas.className = "fx-fluid-sheen";
    canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);
    const gl = canvas.getContext("webgl2", { alpha: true, depth: false, stencil: false, antialias: false, premultipliedAlpha: true });
    if (!gl) { canvas.remove(); return; }
    gl.getExtension("EXT_color_buffer_float");
    const linear = !!gl.getExtension("OES_texture_float_linear");
    const o = {
      curl: +(options.curl ?? 10), iter: Number(options.iter) || 20, flow: +(options.flow ?? 2), fade: +(options.fade ?? 3.5),
      radius: Number(options.radius) || 0.005, force: +(options.force ?? 6000), sim: Number(options.sim) || 128, dye: Number(options.dye) || 512,
      strength: +(options.strength ?? 0.5), alpha: +(options.alpha ?? 0.85), seeds: +(options.seeds ?? 6),
    };
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const vs = sh(gl.VERTEX_SHADER, VS);
    const P = {};
    for (const [k, src] of Object.entries(FS)) {
      const pr = gl.createProgram();
      gl.attachShader(pr, vs); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, HEAD + src));
      gl.bindAttribLocation(pr, 0, "p"); gl.linkProgram(pr);
      const u = {};
      for (let i = 0, n = gl.getProgramParameter(pr, gl.ACTIVE_UNIFORMS); i < n; i++) { const a = gl.getActiveUniform(pr, i); u[a.name] = gl.getUniformLocation(pr, a.name); }
      P[k] = { pr, u };
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    const fbo = (w, h, ifmt, fmt, filter) => {
      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
      for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, filter], [gl.TEXTURE_MAG_FILTER, filter], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
      gl.texImage2D(gl.TEXTURE_2D, 0, ifmt, w, h, 0, fmt, gl.HALF_FLOAT, null);
      const f = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.viewport(0, 0, w, h); gl.clear(gl.COLOR_BUFFER_BIT);
      return { tex, f, w, h, at(u) { gl.activeTexture(gl.TEXTURE0 + u); gl.bindTexture(gl.TEXTURE_2D, tex); return u; } };
    };
    const dbl = (...a) => { let A = fbo(...a), B = fbo(...a); return { get r() { return A; }, get w() { return B; }, swap() { [A, B] = [B, A]; } }; };
    const res = (n) => { let a = gl.drawingBufferWidth / gl.drawingBufferHeight; if (a < 1) a = 1 / a; const lo = Math.round(n), hi = Math.round(n * a); return gl.drawingBufferWidth > gl.drawingBufferHeight ? [hi, lo] : [lo, hi]; };
    const blit = (t) => { if (t) { gl.viewport(0, 0, t.w, t.h); gl.bindFramebuffer(gl.FRAMEBUFFER, t.f); } else { gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight); gl.bindFramebuffer(gl.FRAMEBUFFER, null); } gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0); };
    let vel, dye, divg, curlT, pres;
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr)), h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width === w && canvas.height === h && vel) return;
      canvas.width = w; canvas.height = h;
      const filt = linear ? gl.LINEAR : gl.NEAREST;
      const [sw, shh] = res(o.sim), [dw, dh] = res(linear ? o.dye : o.dye / 2);
      vel = dbl(sw, shh, gl.RG16F, gl.RG, filt);
      dye = dbl(dw, dh, gl.RGBA16F, gl.RGBA, filt);
      divg = fbo(sw, shh, gl.R16F, gl.RED, gl.NEAREST);
      curlT = fbo(sw, shh, gl.R16F, gl.RED, gl.NEAREST);
      pres = dbl(sw, shh, gl.R16F, gl.RED, gl.NEAREST);
    };
    // The attached element’s text color (currentColor) is the light color — values like color-mix are also resolved through a 1px canvas
    const pix = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    let tint = [1, 1, 1], base = 0.5;
    const readTint = () => {
      pix.clearRect(0, 0, 1, 1); pix.fillStyle = getComputedStyle(el).color; pix.fillRect(0, 0, 1, 1);
      const d = pix.getImageData(0, 0, 1, 1).data;
      tint = [d[0] / 255, d[1] / 255, d[2] / 255];
      base = o.strength * (0.299 * tint[0] + 0.587 * tint[1] + 0.114 * tint[2]);
    };
    readTint();
    const pick = () => { const e = Math.min(Math.max(base * (1 + (Math.random() - 0.5) * 0.14), 0), 1); return [e, e, e]; };
    const splat = (x, y, dx, dy, c) => {
      const aspect = canvas.width / canvas.height;
      gl.useProgram(P.splat.pr);
      gl.uniform1i(P.splat.u.a, vel.r.at(0)); gl.uniform1f(P.splat.u.aspect, aspect); gl.uniform2f(P.splat.u.at, x, y);
      gl.uniform3f(P.splat.u.c, dx, dy, 0); gl.uniform1f(P.splat.u.rad, aspect > 1 ? o.radius * aspect : o.radius);
      blit(vel.w); vel.swap();
      gl.uniform1i(P.splat.u.a, dye.r.at(0)); gl.uniform3f(P.splat.u.c, c[0], c[1], c[2]);
      blit(dye.w); dye.swap();
    };
    const m = { x: 0, y: 0, dx: 0, dy: 0, moved: false, c: pick() };
    const move = (cx, cy) => {
      const rc = canvas.getBoundingClientRect();
      if (!rc.width || !rc.height) return;
      const px = m.x, py = m.y;
      m.x = (cx - rc.left) / rc.width; m.y = 1 - (cy - rc.top) / rc.height;
      const a = canvas.width / canvas.height;
      m.dx = a < 1 ? (m.x - px) * a : m.x - px;
      m.dy = a > 1 ? (m.y - py) / a : m.y - py;
      m.moved = m.x >= 0 && m.x <= 1 && m.y >= 0 && m.y <= 1;
    };
    const onMove = (e) => move(e.clientX, e.clientY);
    const onDown = (e) => { move(e.clientX, e.clientY); splat(m.x, m.y, 10 * (Math.random() - 0.5), 30 * (Math.random() - 0.5), pick()); };
    let seen = true, last = 0, tick = 0, raf = 0, dead = false;
    const io = new IntersectionObserver(([e]) => { seen = !!e?.isIntersecting; last = 0; });
    const step = (now) => {
      if (dead) return;
      raf = requestAnimationFrame(step);
      if (!seen) return;
      if (!last) last = now;
      const dt = Math.min(Math.max(1, now - last), 1000 / 60) / 1000;
      last = now;
      size();
      if ((tick += 10 * dt) >= 1) { tick = 0; m.c = pick(); }
      if (m.moved) { m.moved = false; splat(m.x, m.y, o.force * m.dx, o.force * m.dy, m.c); }
      gl.disable(gl.BLEND);
      const use = (k, t) => { gl.useProgram(P[k].pr); gl.uniform2f(P[k].u.px, 1 / t.w, 1 / t.h); return P[k].u; };
      let u = use("curl", vel.r); gl.uniform1i(u.v, vel.r.at(0)); blit(curlT);
      u = use("vort", vel.r); gl.uniform1i(u.v, vel.r.at(0)); gl.uniform1i(u.w, curlT.at(1)); gl.uniform1f(u.k, o.curl); gl.uniform1f(u.dt, dt); blit(vel.w); vel.swap();
      u = use("div", vel.r); gl.uniform1i(u.v, vel.r.at(0)); blit(divg);
      u = use("copy", pres.r); gl.uniform1i(u.a, pres.r.at(0)); gl.uniform1f(u.k, 0.1); blit(pres.w); pres.swap();
      u = use("press", pres.r); gl.uniform1i(u.d, divg.at(0));
      for (let i = 0; i < o.iter; i++) { gl.uniform1i(u.p, pres.r.at(1)); blit(pres.w); pres.swap(); }
      u = use("grad", vel.r); gl.uniform1i(u.p, pres.r.at(0)); gl.uniform1i(u.v, vel.r.at(1)); blit(vel.w); vel.swap();
      u = use("advect", vel.r); gl.uniform1i(u.v, vel.r.at(0)); gl.uniform1i(u.s, vel.r.at(0)); gl.uniform1f(u.dt, dt); gl.uniform1f(u.diss, o.flow); blit(vel.w); vel.swap();
      gl.uniform1i(u.v, vel.r.at(0)); gl.uniform1i(u.s, dye.r.at(1)); gl.uniform1f(u.diss, o.fade); blit(dye.w); dye.swap();
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.enable(gl.BLEND);
      u = use("show", { w: gl.drawingBufferWidth, h: gl.drawingBufferHeight });
      gl.uniform1i(u.a, dye.r.at(0)); gl.uniform3f(u.tint, tint[0], tint[1], tint[2]); gl.uniform1f(u.alpha, o.alpha);
      blit(null);
    };
    size();
    for (let i = 0; i < o.seeds; i++) splat(Math.random(), Math.random(), 900 * (Math.random() - 0.5), 900 * (Math.random() - 0.5), pick());
    io.observe(el);
    el.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mousedown", onDown, { passive: true });
    raf = requestAnimationFrame(step);
    return () => {
      dead = true; cancelAnimationFrame(raf); io.disconnect();
      el.removeEventListener("mousemove", onMove); el.removeEventListener("mousedown", onDown);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  });
})();
