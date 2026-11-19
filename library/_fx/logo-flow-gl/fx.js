(() => {
  // Original Brand (a design-tool Logo Gradient shader): inside the logo shape a turbulence pattern in a four-color palette flows as if melting, and when the cursor passes
  // A half-resolution push field pushes the pattern and then settles. The pattern bakes along the shape’s depth (distance from edge to inside) and the edge is bright.
  // Values (as in the original): angle 238° · bend 1 · outline .8 · scale .3 · speed .4 (melt: time × .4, horizontal flow × .4) · turbulence strength .41 · frequency 1.25 · 8 passes · ripple 5
  //                   Cursor push .8 · radius .9 (brush = .09) · remainder .28 (.895 times between .86~.985 per frame) · stretch 1 · neighbor mix .12 · speed easing .75^frame
  const VS = `#version 300 es
    in vec2 aPos; out vec2 vUv;
    void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

  // Push field: blend the previous frame’s field slightly with its neighbors and shrink it, then add cursor velocity to an ellipse around the cursor (stretched in the direction of motion). zw is the smoothed cursor velocity
  const PUSH = `#version 300 es
    precision highp float;
    in vec2 vUv; out vec4 o;
    uniform sampler2D uPrev; uniform vec2 uTexel, uMouse, uVel; uniform float uAspect, uFrames, uHover, uDt, uPersist, uRadius, uPush, uStretch;
    void main() {
      vec4 prev = texture(uPrev, vUv);
      vec2 around = texture(uPrev, vUv + vec2(uTexel.x, 0.0)).xy + texture(uPrev, vUv - vec2(uTexel.x, 0.0)).xy
                  + texture(uPrev, vUv + vec2(0.0, uTexel.y)).xy + texture(uPrev, vUv - vec2(0.0, uTexel.y)).xy;
      vec2 field = mix(prev.xy, around * 0.25, 0.12) * pow(mix(0.86, 0.985, clamp(uPersist, 0.0, 1.0)), uFrames);
      vec2 fix = vec2(uAspect, 1.0);
      vec2 vel = mix(prev.zw, uVel * fix * uHover, 1.0 - pow(0.75, uFrames));
      float sp = length(vel);
      float moving = 1.0 - exp(-0.5 * sp / max(uDt, 1e-4));
      vec2 dir = sp > 1e-5 ? vel / sp : vec2(1.0, 0.0);
      vec2 rel = (vUv - uMouse) * fix;
      float brush = max(uRadius * 0.1, 0.001);
      float a = dot(rel, dir) / (brush * (1.0 + uStretch * moving));
      float b = dot(rel, vec2(-dir.y, dir.x)) / brush;
      field += vel * exp(-(a * a + b * b)) * uPush * 0.1 * uHover;
      o = vec4(clamp(field, -1.0, 1.0), vel);
    }`;

  // Image: holds the shape map (R depth · G·A depth gradient direction · B occlusion) fitted to the cell by aspect ratio, and layers sine turbulence over depth-bent coordinates to get band values.
  // Paint the band value with a four-color palette (blended in OKLab) and lift the edge side brighter by the outline amount
  const FS = `#version 300 es
    precision highp float;
    in vec2 vUv; out vec4 o;
    uniform sampler2D uShape, uPush; uniform vec2 uRes, uShapeSize;
    uniform float uTime, uSpeed, uAngle, uBend, uContour, uScale, uAmp, uFreq, uWave; uniform int uIter;
    uniform vec3 uLab[4];
    vec3 labToLinear(vec3 c) {
      float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z, m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z, s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
      l *= l * l; m *= m * m; s *= s * s;
      return vec3(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
    }
    vec3 palette(float t) {
      t = clamp(t, 0.0, 1.0) * 3.0;
      vec3 lab = t < 1.0 ? mix(uLab[0], uLab[1], t) : t < 2.0 ? mix(uLab[1], uLab[2], t - 1.0) : mix(uLab[2], uLab[3], t - 2.0);
      return labToLinear(lab);
    }
    mat2 turn(float a) { float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }
    void main() {
      vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
      float shapeAspect = uShapeSize.x / uShapeSize.y, boxAspect = uRes.x / uRes.y;
      if (boxAspect > shapeAspect) uv.x = (uv.x - 0.5) * boxAspect / shapeAspect + 0.5;
      else uv.y = (uv.y - 0.5) * shapeAspect / boxAspect + 0.5;
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) { o = vec4(0.0); return; }
      vec4 sh = texture(uShape, uv);
      float edge = 0.5 * fwidth(sh.b);
      float alpha = smoothstep(0.5 - edge, 0.5 + edge, sh.b);
      if (alpha < 0.001) { o = vec4(0.0); return; }
      float depth = max(sh.r, 0.001);
      vec2 down = sh.ga * 2.0 - 1.0;
      vec2 along = vec2(-down.y, down.x);
      float t = mod(uTime * uSpeed, 3600.0);
      mat2 rot = turn(radians(uAngle));
      vec2 p = (uv - 0.5) * 2.0; p.x *= shapeAspect;
      p = rot * p;
      vec2 pushed = texture(uPush, vUv).xy * vec2(1.0, -1.0);
      if (boxAspect <= shapeAspect) pushed *= shapeAspect / boxAspect;
      p -= (rot * pushed) * 2.0;
      float rim = 1.0 - smoothstep(0.0, 0.8, depth);
      p *= max(0.4, 0.1 + depth);
      p += (along * 2.0 - down * 0.5) * rim * uBend;
      p *= max(0.5, mix(1.0, 0.4 + 0.6 * smoothstep(0.0, 0.5, depth), uContour));
      vec2 q = p * uScale + vec2(t * 0.4, 0.0);
      float tt = t * 0.4, ph1 = 1.7, ph2 = -2.3;
      for (int i = 2; i < 10; i++) {
        if (i >= uIter) break;
        float k = float(i);
        q += uAmp * sin(length(q) * uFreq * k + tt + vec2(ph1, ph2) + vec2(0.31, 0.73) * k) / k;
        ph1 += cos(k + ph2 * 1.2 + q.x * 2.0 - tt);
        ph2 += sin(k * q.y + ph1 + tt);
      }
      float w = length(q.yx + vec2(ph1, ph2) * 0.2) * uWave;
      float v = 0.5 + 0.125 * sin(w + 1.0) + 0.25 * sin(w + 4.0) + 0.125 * sin(w + 9.0);
      v = clamp((v - 0.3) / 0.4, 0.0, 1.0);
      float inner = smoothstep(0.0, 0.4, depth);
      v = mix(v, v * inner + (1.0 - inner) * uContour, 0.5 + 0.5 * uContour);
      vec3 col = pow(clamp(palette(v), 0.0, 1.0), vec3(1.0 / 2.2));
      o = vec4(col * alpha, alpha);
    }`;

  // Shape (<svg>·<img>) is baked onto a canvas, and the inner distance (3-4 clip distance) is measured to pack depth, tilt direction and occlusion into one image
  const bake = (img, ratio) => {
    const W = 360, H = Math.max(8, Math.round(W / ratio));
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d", { willReadFrequently: true });
    g.drawImage(img, 0, 0, W, H);
    const px = g.getImageData(0, 0, W, H).data;
    const n = W * H, inside = new Uint8Array(n), d = new Float32Array(n);
    for (let i = 0; i < n; i++) { inside[i] = px[i * 4 + 3] > 127 ? 1 : 0; d[i] = inside[i] ? 1e9 : 0; }
    const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : d[y * W + x]);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x; if (!inside[i]) continue;
      d[i] = Math.min(d[i], at(x - 1, y) + 3, at(x, y - 1) + 3, at(x - 1, y - 1) + 4, at(x + 1, y - 1) + 4);
    }
    for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) {
      const i = y * W + x; if (!inside[i]) continue;
      d[i] = Math.min(d[i], at(x + 1, y) + 3, at(x, y + 1) + 3, at(x + 1, y + 1) + 4, at(x - 1, y + 1) + 4);
    }
    let max = 1;
    for (let i = 0; i < n; i++) if (d[i] > max) max = d[i];
    // Like the original, spread depth evenly over a 6-cell radius (three box blurs), then measure the slope by the difference across 4 cells
    let a = Float32Array.from(d, (v) => v / max), b = new Float32Array(n);
    const R = 6;
    for (let pass = 0; pass < 3; pass++) {
      for (let y = 0; y < H; y++) { let s = 0; for (let x = -R; x <= R; x++) s += a[y * W + Math.min(W - 1, Math.max(0, x))]; for (let x = 0; x < W; x++) { b[y * W + x] = s / (2 * R + 1); s += a[y * W + Math.min(W - 1, x + R + 1)] - a[y * W + Math.max(0, x - R)]; } }
      for (let x = 0; x < W; x++) { let s = 0; for (let y = -R; y <= R; y++) s += b[Math.min(H - 1, Math.max(0, y)) * W + x]; for (let y = 0; y < H; y++) { a[y * W + x] = s / (2 * R + 1); s += b[Math.min(H - 1, y + R + 1) * W + x] - b[Math.max(0, y - R) * W + x]; } }
    }
    const out = g.createImageData(W, H), o = out.data, E = 4;
    const A = (x, y) => a[Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, gx = A(x + E, y) - A(x - E, y), gy = A(x, y + E) - A(x, y - E), len = Math.hypot(gx, gy);
      const ux = len > 1e-5 ? gx / len : 0, uy = len > 1e-5 ? gy / len : 0;
      o[i * 4] = Math.round(Math.min(1, a[i] * 1.6) * 255);
      o[i * 4 + 1] = Math.round((ux * 0.5 + 0.5) * 255);
      o[i * 4 + 2] = px[i * 4 + 3];
      o[i * 4 + 3] = Math.round((uy * 0.5 + 0.5) * 255);
    }
    return { data: out, W, H };
  };

  // Resolve color variables (including color-mix) to real sRGB — paint the computed color of a temporary text in a cell onto a 1px canvas and read it back
  const toLab = (el, name, fallback) => {
    const probe = document.createElement("span");
    probe.style.cssText = `position:absolute;visibility:hidden;color:var(${name}, ${fallback})`;
    el.append(probe);
    const css = getComputedStyle(probe).color;
    probe.remove();
    const c = document.createElement("canvas"); c.width = c.height = 1;
    const g = c.getContext("2d"); g.fillStyle = css; g.fillRect(0, 0, 1, 1);
    const [r, gg, b] = g.getImageData(0, 0, 1, 1).data;
    const lin = [r, gg, b].map((v) => Math.pow(v / 255, 2.2));
    const l = Math.cbrt(0.4122214708 * lin[0] + 0.5363325363 * lin[1] + 0.0514459929 * lin[2]);
    const m = Math.cbrt(0.2119034982 * lin[0] + 0.6806995451 * lin[1] + 0.1073969566 * lin[2]);
    const s = Math.cbrt(0.0883024619 * lin[0] + 0.2817188376 * lin[1] + 0.6299787005 * lin[2]);
    return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
  };

  const toImage = (shape) => new Promise((resolve) => {
    if (shape instanceof HTMLImageElement) {
      if (shape.complete && shape.naturalWidth) return resolve(shape);
      shape.addEventListener("load", () => resolve(shape), { once: true });
      shape.addEventListener("error", () => resolve(null), { once: true });
      return;
    }
    if (!(shape instanceof SVGSVGElement)) return resolve(null);
    const clone = shape.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", "720"); clone.setAttribute("height", String(Math.round(720 / ratioOf(shape))));
    clone.style.color = "#000"; /* Not skin: opaque ink baked onto the masking canvas — never shown on screen */
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`;
  });
  const ratioOf = (shape) => {
    if (shape instanceof HTMLImageElement) return (shape.naturalWidth || 1) / (shape.naturalHeight || 1);
    const vb = shape.viewBox && shape.viewBox.baseVal;
    if (vb && vb.width) return vb.width / vb.height;
    const r = shape.getBoundingClientRect();
    return r.width && r.height ? r.width / r.height : 1;
  };

  kfFx.register("logo-flow-gl", (el, { options, reduce, hover }) => {
    const shape = el.querySelector('[data-fx-part="shape"]');
    if (!shape) return;
    const num = (k, d) => +(options[k] ?? d);
    const P = {
      angle: num("angle", 238), bend: num("bend", 1), contour: num("contour", 0.8), scale: num("scale", 0.3), speed: num("speed", 0.4),
      amp: num("amp", 0.41), freq: num("freq", 1.25), iter: Math.max(2, Math.min(10, +options.iter || 8)), wave: num("wave", 5),
      push: num("push", 0.8), radius: num("radius", 0.9), persist: num("persist", 0.28), stretch: num("stretch", 1),
    };
    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-fx-part", "flow");
    canvas.setAttribute("aria-hidden", "true");
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: true, antialias: false, alpha: true });
    if (!gl) return;
    const floatOk = !!gl.getExtension("EXT_color_buffer_float");
    const program = (fsrc) => {
      const make = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
      const v = make(gl.VERTEX_SHADER, VS), f = make(gl.FRAGMENT_SHADER, fsrc);
      if (!v || !f) return null;
      const p = gl.createProgram();
      gl.attachShader(p, v); gl.attachShader(p, f); gl.bindAttribLocation(p, 0, "aPos"); gl.linkProgram(p);
      return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
    };
    // Shaders are precompiled on attach — compiling on the first cursor move freezes the screen
    const draw = program(FS), pushProg = floatOk ? program(PUSH) : null;
    if (!draw) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const loc = (p, names) => Object.fromEntries(names.map((k) => [k, gl.getUniformLocation(p, k)]));
    const U = loc(draw, ["uShape", "uPush", "uRes", "uShapeSize", "uTime", "uSpeed", "uAngle", "uBend", "uContour", "uScale", "uAmp", "uFreq", "uWave", "uIter", "uLab"]);
    const UP = pushProg && loc(pushProg, ["uPrev", "uTexel", "uMouse", "uVel", "uAspect", "uFrames", "uHover", "uDt", "uPersist", "uRadius", "uPush", "uStretch"]);
    const texture = (filter) => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };
    const shapeTex = texture(gl.LINEAR);
    // The push field alternates two half-resolution sheets. Without a float canvas, only one empty sheet is kept so it draws just the flow with no cursor push
    const fields = [0, 1].map(() => ({ tex: texture(gl.LINEAR), fbo: gl.createFramebuffer() }));
    let fw = 1, fh = 1, cur = 0;
    const sizeFields = () => {
      fields.forEach((f) => {
        gl.bindTexture(gl.TEXTURE_2D, f.tex);
        if (pushProg) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, fw, fh, 0, gl.RGBA, gl.HALF_FLOAT, null);
        else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
        if (!pushProg) return;
        gl.bindFramebuffer(gl.FRAMEBUFFER, f.fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, f.tex, 0);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      });
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    const ratio = ratioOf(shape);
    let baked = null, alive = true, laid = false;
    // Four color slots — light glow → accent → deep accent (the side that melts into the background). Users override them with --fx-c1~4
    const FALL = ["color-mix(in oklab, var(--kf-accent) 50%, var(--kf-bg))", "color-mix(in oklab, var(--kf-accent) 85%, var(--kf-bg))", "var(--kf-accent)", "color-mix(in oklab, var(--kf-accent) 88%, var(--kf-ink))"];
    const lab = () => FALL.flatMap((f, i) => toLab(el, `--fx-c${i + 1}`, f));
    let colors = lab();
    el.append(canvas);
    const place = () => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      const nw = Math.max(1, canvas.width >> 1), nh = Math.max(1, canvas.height >> 1);
      if (nw !== fw || nh !== fh || !laid) { fw = nw; fh = nh; sizeFields(); }
      laid = true;
      if (reduce) render(performance.now());
    };
    const ro = new ResizeObserver(place);
    ro.observe(el);

    // Cursor only inside the cell — converted to cell coordinates (0 at the bottom), passing the per-frame movement as speed
    let mouse = [0.5, 0.5], last = null, inside = 0;
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      mouse = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
      inside = 1;
      if (!last) last = mouse.slice();
    };
    const onLeave = () => { inside = 0; last = null; };
    if (hover && !reduce && pushProg) {
      el.addEventListener("pointermove", onMove, { passive: true });
      el.addEventListener("pointerleave", onLeave);
    }

    const t0 = performance.now();
    let prevNow = t0, raf = 0, seen = true;
    const render = (now) => {
      if (!baked) return;
      const dt = Math.max(1, now - prevNow) / 1000;
      prevNow = now;
      const frames = Math.min(3, Math.max(0, dt * 60));
      if (pushProg) {
        const from = fields[cur], to = fields[1 - cur];
        const vel = last ? [mouse[0] - last[0], mouse[1] - last[1]] : [0, 0];
        if (last) last = mouse.slice();
        gl.useProgram(pushProg);
        gl.bindFramebuffer(gl.FRAMEBUFFER, to.fbo);
        gl.viewport(0, 0, fw, fh);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, from.tex);
        gl.uniform1i(UP.uPrev, 0);
        gl.uniform2f(UP.uTexel, 1 / fw, 1 / fh);
        gl.uniform2f(UP.uMouse, mouse[0], mouse[1]);
        gl.uniform2f(UP.uVel, vel[0], vel[1]);
        gl.uniform1f(UP.uAspect, canvas.width / canvas.height);
        gl.uniform1f(UP.uFrames, frames);
        gl.uniform1f(UP.uHover, inside);
        gl.uniform1f(UP.uDt, dt);
        gl.uniform1f(UP.uPersist, P.persist); gl.uniform1f(UP.uRadius, P.radius); gl.uniform1f(UP.uPush, P.push); gl.uniform1f(UP.uStretch, P.stretch);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        cur = 1 - cur;
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(draw);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, shapeTex);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, fields[cur].tex);
      gl.uniform1i(U.uShape, 0); gl.uniform1i(U.uPush, 1);
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
      gl.uniform2f(U.uShapeSize, baked.W, baked.H);
      gl.uniform1f(U.uTime, reduce ? 12 : (now - t0) / 1000);
      gl.uniform1f(U.uSpeed, P.speed); gl.uniform1f(U.uAngle, P.angle); gl.uniform1f(U.uBend, P.bend); gl.uniform1f(U.uContour, P.contour);
      gl.uniform1f(U.uScale, P.scale); gl.uniform1f(U.uAmp, P.amp); gl.uniform1f(U.uFreq, P.freq); gl.uniform1f(U.uWave, P.wave);
      gl.uniform1i(U.uIter, P.iter);
      gl.uniform3fv(U.uLab, colors);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (seen) render(now);
      else prevNow = now;
    };
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting));
    io.observe(el);

    toImage(shape).then((img) => {
      if (!alive || !img) return;
      baked = bake(img, ratio);
      gl.bindTexture(gl.TEXTURE_2D, shapeTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, baked.data);
      colors = lab();
      place();
      el.setAttribute("data-gl", "");
      render(performance.now());
      if (!reduce) raf = requestAnimationFrame(frame);
      el.dispatchEvent(new CustomEvent("fx:ready", { bubbles: true }));
    });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
      el.removeAttribute("data-gl");
    };
  });
})();
