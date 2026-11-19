// Hero cursor fluid — paint spreads and flows where the cursor passed, then fades, and only where the paint is dense does the photo regain its color (threshold .66 lowered by up to .9 the closer it is).
// The photo layer is pushed away from the cursor by its depth (parallax .015, inertia .025 per frame) and grows up to 3% the farther the cursor is from the center.
// Original values: brush 2.8 (2^-distance) · force 3× screen px · paint .65 · swirl 4 · velocity damping .906 · paint damping .947 · pressure 12 passes · depth block .33 · depth stick .9 · panel resolution .4 · pixel ratio 1.5 · clears the panel 14.5s after the pointer stops.
// Since photos are placeholders, shapes in the depth map slot (athlete helmet and body, car) are faintly drawn and made to shift, and the accent color goes only on the shapes instead of a color fill (the original background is achromatic, so it wouldn’t show anyway) — with a real photo, just read the photo in the scene() slot.
(() => {
  const NH = (window.NH = window.NH || {});
  const T = { brush: 2.8, force: 3, dye: 0.65, curl: 4, velFade: 0.906, dyeFade: 0.947, iters: 12, depthBlock: 0.33, cling: 0.9, threshold: 0.66, edge: 0.97, depthBias: 0.9, parallax: 0.015, inertia: 0.025, simScale: 0.4, dpr: 1.5 };
  // Until the place where paint lingers longest (deep adhesion .9 → .9929 per step) shrinks to .25% + .5s
  const LIVE = (() => { const f = T.dyeFade + (0.998 - T.dyeFade) * T.cling; return Math.min(3e4, Math.max(2e3, (Math.log(0.0025) / Math.log(f)) / 60 * 1000 + 500)); })();
  NH.heroFluid = (canvas, photo) => {
    if (!canvas || NH.reduce || !NH.fine) return null;
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: false });
    if (!gl) return null;
    const hf = gl.getExtension("OES_texture_half_float");
    gl.getExtension("OES_texture_half_float_linear");
    if (!hf) return null;
    const TYPE = hf.HALF_FLOAT_OES;
    const VS = `attribute vec2 p; varying vec2 vUv, vL, vR, vT, vB; uniform vec2 tx;
      void main(){ vUv = p * .5 + .5; vL = vUv - vec2(tx.x, 0.); vR = vUv + vec2(tx.x, 0.); vT = vUv + vec2(0., tx.y); vB = vUv - vec2(0., tx.y); gl_Position = vec4(p, 0., 1.); }`;
    const H = "precision highp float; varying vec2 vUv, vL, vR, vT, vB; uniform vec2 tx;";
    // Original depth map slots — left athlete (helmet, body, frontmost .9) · right car (.45) · background (.03). Positions follow the photo outline of the original Hero at 1440×900, in screen-height units.
    // scene(u).x is the brightness to draw (white alpha), .y is depth. Horizontal ratio is read from the plate cell size (tx = 1/panel width, 1/panel height).
    // Depth blurs the outline by ±.03 (screen height) — it has to be smooth like the original depth map so the correction for shifted spots doesn’t fold (a knife-edge outline would smear the border into a double)
    const SCENE = `
      float inside(float sd, float w){ return 1. - smoothstep(-w, w, sd); }
      float oval(vec2 p, vec2 c, vec2 r){ return (length((p - c) / r) - 1.) * min(r.x, r.y); }
      vec2 scene(vec2 u){
        vec2 p = vec2(u.x * tx.y / tx.x, u.y);
        float sHelm = oval(p, vec2(.5, .678), vec2(.2, .215));
        float sBody = min(max(abs(p.x - .38) - mix(.25, .17, clamp(u.y / .44, 0., 1.)), u.y - .44), oval(p, vec2(.38, .44), vec2(.185, .06)));
        float sCar = max(.98 - .08 * u.y - p.x, u.y - .86 + .03 * (p.x - .92));
        float helm = inside(sHelm, .002), body = inside(sBody, .002), car = inside(sCar, .002);
        vec2 hq = p - vec2(.5, .678);
        float visor = helm * inside(abs(hq.y + .05 - .25 * hq.x) - .055, .002) * inside(-.06 - hq.x, .002);
        float crown = helm * inside(abs(hq.y - .1 + .45 * hq.x) - .022, .002);
        float zip = body * inside(abs(p.x - .405) - .006, .002) * inside(u.y - .43, .002);
        vec2 b1 = abs(p - vec2(.3, .3)) - vec2(.06, .035), b2 = abs(p - vec2(.47, .24)) - vec2(.045, .05), b3 = abs(p - vec2(.27, .12)) - vec2(.05, .025);
        float patch = body * inside(min(min(max(b1.x, b1.y), max(b2.x, b2.y)), max(b3.x, b3.y)), .002);
        float glass = car * inside(abs(u.y - .745) - .04, .002) * inside(abs(p.x - 1.22) - .2, .002);
        float stripe = car * max(inside(abs(p.x - 1.18 + (u.y - .5) * .9) - .045, .002), inside(abs(p.x - 1.36 + (u.y - .5) * .9) - .018, .002));
        float driver = max(helm, body);
        float a = mix(car * mix(.12, .24, stripe) * (1. - .7 * glass), helm * (1. - .8 * visor) * mix(.22, .34, crown) + body * (1. - helm) * (1. - .75 * zip) * mix(.16, .3, patch), driver);
        float d = mix(mix(.03, .45, inside(sCar, .03)), .9, inside(min(sHelm, sBody), .03));
        return vec2(a, d);
      }`;
    const DEPTH = `${SCENE} float depth(vec2 u){ return scene(u).y; }`;
    const FS = {
      splat: `${H} uniform sampler2D a; uniform float r; uniform vec3 v; uniform vec2 pt; uniform float size;
        void main(){ vec2 d = vUv - pt; d.x *= r; gl_FragColor = vec4(texture2D(a, vUv).xyz + exp2(-dot(d, d) / size) * v, 1.); }`,
      advect: `${H} ${DEPTH} uniform sampler2D vel, src; uniform float dt, fade, cling;
        void main(){ vec2 c = vUv - dt * texture2D(vel, vUv).xy * tx; float f = mix(fade, .998, depth(vUv) * cling); gl_FragColor = f * texture2D(src, c); }`,
      curl: `${H} uniform sampler2D vel;
        void main(){ float L = texture2D(vel, vL).y, R = texture2D(vel, vR).y, Tt = texture2D(vel, vT).x, B = texture2D(vel, vB).x; gl_FragColor = vec4(.5 * (R - L - Tt + B), 0., 0., 1.); }`,
      vort: `${H} uniform sampler2D vel, cu; uniform float k, dt;
        void main(){ float L = texture2D(cu, vL).x, R = texture2D(cu, vR).x, Tt = texture2D(cu, vT).x, B = texture2D(cu, vB).x, C = texture2D(cu, vUv).x;
          vec2 f = .5 * vec2(abs(Tt) - abs(B), abs(R) - abs(L)); f /= length(f) + .0001; f *= k * C; f.y *= -1.;
          gl_FragColor = vec4(texture2D(vel, vUv).xy + f * dt, 0., 1.); }`,
      div: `${H} uniform sampler2D vel;
        void main(){ float L = texture2D(vel, vL).x, R = texture2D(vel, vR).x, Tt = texture2D(vel, vT).y, B = texture2D(vel, vB).y; gl_FragColor = vec4(.6 * (R - L + Tt - B), 0., 0., 1.); }`,
      press: `${H} ${DEPTH} uniform sampler2D pr, dv; uniform float block;
        void main(){ float p = (texture2D(pr, vL).x + texture2D(pr, vR).x + texture2D(pr, vT).x + texture2D(pr, vB).x - texture2D(dv, vUv).x) * .25; gl_FragColor = vec4(p + block * depth(vUv) * .01, 0., 0., 1.); }`,
      grad: `${H} uniform sampler2D pr, vel;
        void main(){ vec2 v = texture2D(vel, vUv).xy - vec2(texture2D(pr, vR).x - texture2D(pr, vL).x, texture2D(pr, vT).x - texture2D(pr, vB).x); gl_FragColor = vec4(v, 0., 1.); }`,
      scale: `${H} uniform sampler2D a; uniform float s; void main(){ gl_FragColor = s * texture2D(a, vUv); }`,
      // Moves to the picture slot box (the photo spot inside the panel), zooms around the center, and re-reads the position pushed by depth three times so the pushed depth moves along with the picture
      show: `${H} ${SCENE} uniform sampler2D dye; uniform vec3 col; uniform vec4 box; uniform vec2 ms; uniform float th, edge, bias, par, zoom;
        void main(){
          vec2 b = .5 + ((vUv - box.xy) / (box.zw - box.xy) - .5) / zoom;
          vec2 s = ms * par * scene(b).y;
          for (int i = 0; i < 3; i++) s += (ms * par * scene(clamp(b + s, 0., 1.)).y - s) * .6;
          vec2 sc = scene(clamp(b + s, 0., 1.));
          float t = th * (1. - bias * sc.y);
          float m = smoothstep(t - edge, t + edge, texture2D(dye, vUv).r);
          gl_FragColor = vec4(mix(vec3(1.), col, m), sc.x * mix(1., 2.2, m)); }`,
    };
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const vs = sh(gl.VERTEX_SHADER, VS);
    const progs = {};
    for (const k in FS) {
      const p = gl.createProgram();
      gl.attachShader(p, vs); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS[k])); gl.bindAttribLocation(p, 0, "p"); gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
      const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name] = gl.getUniformLocation(p, a.name); }
      progs[k] = { p, u };
    }
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const fbo = (w, h) => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, TYPE, null);
      const f = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      return { t, f, w, h };
    };
    const pair = (w, h) => { let a = fbo(w, h), b = fbo(w, h); return { get r() { return a; }, get w() { return b; }, swap() { [a, b] = [b, a]; } }; };
    let W, Hh, vel, dye, pr, cu, dv;
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, T.dpr);
      canvas.width = Math.max(1, canvas.clientWidth * dpr); canvas.height = Math.max(1, canvas.clientHeight * dpr);
      W = Math.max(8, Math.round(canvas.width * T.simScale)); Hh = Math.max(8, Math.round(canvas.height * T.simScale));
      vel = pair(W, Hh); dye = pair(W, Hh); pr = pair(W, Hh); cu = fbo(W, Hh); dv = fbo(W, Hh);
    };
    resize();
    const run = (k, target, set) => {
      const P = progs[k]; gl.useProgram(P.p);
      gl.uniform2f(P.u.tx, 1 / W, 1 / Hh);
      let unit = 0;
      for (const n in set) {
        const v = set[n], loc = P.u[n];
        if (loc == null) continue;
        if (v && v.t) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, v.t); gl.uniform1i(loc, unit++); }
        else if (Array.isArray(v)) [, , gl.uniform2f, gl.uniform3f, gl.uniform4f][v.length].call(gl, loc, ...v);
        else gl.uniform1f(loc, v);
      }
      if (target) { gl.bindFramebuffer(gl.FRAMEBUFFER, target.f); gl.viewport(0, 0, target.w, target.h); }
      else { gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height); }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const accent = () => {
      const c = getComputedStyle(document.documentElement).getPropertyValue("--kf-accent").trim();
      const m = c.match(/^#?([0-9a-f]{6})$/i);
      if (!m) return [1, 0.84, 0.04];
      const n = parseInt(m[1], 16);
      return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    };
    let col = accent();
    // Marks appear only inside the board (the first movement on entry just sets the position), parallax works anywhere in the window — leaving the window returns to center
    const ptr = { px: 0, py: 0, x: 0, y: 0, dx: 0, dy: 0, moved: false, inside: false };
    const ms = { tx: 0, ty: 0, sx: 0, sy: 0 };
    let lastMove = -1e9, cleared = true, dirty = 2, boxKey = "";
    const onMove = (e) => {
      ms.tx = e.clientX / innerWidth * 2 - 1; ms.ty = -(e.clientY / innerHeight * 2 - 1);
      const r = canvas.getBoundingClientRect();
      const px = e.clientX - r.left, py = e.clientY - r.top;
      const inside = px >= 0 && py >= 0 && px <= r.width && py <= r.height;
      if (inside) {
        if (!ptr.inside) { ptr.px = px; ptr.py = py; }
        ptr.dx = T.force * (px - ptr.px); ptr.dy = -T.force * (py - ptr.py);
        ptr.px = px; ptr.py = py; ptr.x = px / r.width; ptr.y = 1 - py / r.height;
        ptr.moved = true; lastMove = performance.now();
      }
      ptr.inside = inside;
      kick();
    };
    const onOut = (e) => { if (!e.relatedTarget) { ms.tx = 0; ms.ty = 0; kick(); } };
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerout", onOut);
    const ro = new ResizeObserver(() => { resize(); dirty = 2; kick(); }); ro.observe(canvas);
    let last = performance.now(), raf = 0, visible = true;
    const kick = () => { if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(step); } };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) { dirty = 2; kick(); } });
    io.observe(canvas);
    const clearAll = () => { for (const o of [vel.r, vel.w, dye.r, dye.w, pr.r, pr.w]) { gl.bindFramebuffer(gl.FRAMEBUFFER, o.f); gl.viewport(0, 0, o.w, o.h); gl.clear(gl.COLOR_BUFFER_BIT); } };
    const box = () => {
      const c = canvas.getBoundingClientRect(), p = (photo || canvas).getBoundingClientRect();
      return [(p.left - c.left) / c.width, 1 - (p.bottom - c.top) / c.height, (p.right - c.left) / c.width, 1 - (p.top - c.top) / c.height];
    };
    const sim = (dt) => {
      const ratio = canvas.width / canvas.height, size = T.brush / 1000;
      if (ptr.moved) {
        run("splat", vel.w, { a: vel.r, r: ratio, v: [ptr.dx, ptr.dy, 0], pt: [ptr.x, ptr.y], size }); vel.swap();
        run("splat", dye.w, { a: dye.r, r: ratio, v: [T.dye, T.dye, T.dye], pt: [ptr.x, ptr.y], size }); dye.swap();
        ptr.moved = false;
      }
      run("curl", cu, { vel: vel.r });
      run("vort", vel.w, { vel: vel.r, cu, k: T.curl, dt }); vel.swap();
      run("div", dv, { vel: vel.r });
      run("scale", pr.w, { a: pr.r, s: 0.8 }); pr.swap();
      for (let i = 0; i < T.iters; i++) { run("press", pr.w, { pr: pr.r, dv, block: T.depthBlock }); pr.swap(); }
      run("grad", vel.w, { pr: pr.r, vel: vel.r }); vel.swap();
      run("advect", vel.w, { vel: vel.r, src: vel.r, dt, fade: T.velFade, cling: 0 }); vel.swap();
      run("advect", dye.w, { vel: vel.r, src: dye.r, dt, fade: T.dyeFade, cling: T.cling }); dye.swap();
    };
    const show = () => {
      const n = Math.min(1, Math.hypot(ms.sx, ms.sy)), zoom = 1 / (1 - Math.min(0.4, 2 * T.parallax * n));
      gl.disable(gl.BLEND);
      run("show", null, { dye: dye.r, col, box: box(), ms: [ms.sx, ms.sy], th: T.threshold, edge: Math.max(0.35 * (1 - T.edge), 0.0015), bias: T.depthBias, par: T.parallax, zoom });
    };
    // Run once when setting up all shaders to bake them — compiling for the first time on the first cursor move freezes the screen
    sim(1 / 60); show(); clearAll();
    function step(now) {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(Math.max(1, now - last), 33) / 1000; last = now;
      const live = now - lastMove < LIVE;
      if (live) { sim(dt); cleared = false; }
      else if (!cleared) { clearAll(); cleared = true; dirty = 2; }
      const k = 1 - Math.pow(1 - T.inertia, dt * 60);
      ms.sx += (ms.tx - ms.sx) * k; ms.sy += (ms.ty - ms.sy) * k;
      const following = Math.abs(ms.tx - ms.sx) > 5e-4 || Math.abs(ms.ty - ms.sy) > 5e-4;
      const key = box().map((v) => v.toFixed(4)).join();
      if (key !== boxKey) { boxKey = key; dirty = Math.max(dirty, 1); }
      // Draws only when needed, the ring keeps going while on screen — it must follow the photo slot moving from loader zoom · scrolling
      if (live || following || dirty > 0) { dirty = Math.max(0, dirty - 1); show(); }
      raf = requestAnimationFrame(step);
    }
    kick();
    return { recolor: () => { col = accent(); dirty = 2; kick(); }, destroy: () => { cancelAnimationFrame(raf); removeEventListener("pointermove", onMove); removeEventListener("pointerout", onOut); ro.disconnect(); io.disconnect(); } };
  };
})();
