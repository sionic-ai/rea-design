// Brand site cursor response — the ‹follow the mouse› that the original CrtCanvas attaches to each panel and the footer cave tilt, rebuilt with our shader.
// Values read from the original bundle:
//   Follow — takes the cursor position as a ratio within the board and approaches by .08 each frame (at 60fps), and a second circle at half intensity
//     moves off by (sin1.1t·.5 + sin(2.3t+1.7)·.25, sin1.3t·.5 + sin(2.1t+2.3)·.25)×.02 and always wobbles. Circles are measured from distances where the panel height is 1
//     Blurs between radius−blur and radius+blur, and the brightness mixed toward white turns into a thermal color band (seven colors).
//   Hero (bitmap) strength .5 · radius .05 · blur .1 · 25% mix of 48-line pixels · brightness .55 — hovering a threat tag gives radius .1 · brightness .35 (.4s power2.out), on release .5s power2.inOut
//   see·test strength 1 · radius .1 · blur .2, act radius .08 · blur .18. The whole panel is cut down to 16 lines (1290 and up)·24 (1023~)·32 (743~)·36 pixels and quantized into six brightness steps · brightness .7
//   Work card art (articleCardLight) strength .5 · radius .5 · blur .9 · 5-row pixels — cells get darker the closer the cursor is. On hover strength goes to 1 (.8s) and the blotch pattern turns on (.7s),
//     On release intensity goes to 0 (.25s) and the blotch turns off (5s). The blotch is noise at 250 times the board height drifting .1 per second, squared × .5
//   footer cave — the screen-ratio cursor (−1~1) is chased at .02 per frame and the cave center is pushed up to 2.5% away from the cursor (only while the footer is on screen)
// The original turns all of these off on touch devices.
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const stepRows = () => (innerWidth >= 1290 ? 16 : innerWidth >= 1023 ? 24 : innerWidth >= 743 ? 32 : 36);
  const PRESET = {
    // Brightness (light) is a value where the original backlight (.55·.7) darkens the photo too, so on a copy laid over a placeholder standing in for the finished image it is a relative 1.
    // Base brightness (base) stands in for the average brightness of the original plate image — on the first screen the color band spreads to the circle edge because of window lights in the night photo, so .25 was set to match the recording
    bitmap: { r: 0.05, f: 0.1, gain: 0.5, rows: () => 48, mosaic: 0.25, stepped: 0, base: 0.25, light: 1, scan: 1.5 },
    see: { r: 0.1, f: 0.2, gain: 1, rows: stepRows, mosaic: 1, stepped: 1, base: 0.12, light: 1, scan: 1.5 },
    test: { r: 0.1, f: 0.2, gain: 1, rows: stepRows, mosaic: 1, stepped: 1, base: 0.12, light: 1, scan: 1.5 },
    act: { r: 0.08, f: 0.18, gain: 1, rows: stepRows, mosaic: 1, stepped: 1, base: 0.12, light: 1, scan: 1.5 },
    // The original card layout is shader only with no image, but the copy sits over photo placeholders, so cells are layered semi-transparent to let the placeholder text show through
    card: { r: 0.5, f: 0.9, gain: 0.5, rows: () => 5, mosaic: 1, stepped: 1, base: 0, light: 1, scan: 0, veil: 0.6 },
  };
  // As in the original, it starts off screen above — the circle is invisible until the cursor moves once
  const mouse = { x: innerWidth / 2, y: -innerHeight / 2 };
  const ndc = { x: 0, y: 0 };
  addEventListener("mousemove", (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    ndc.x = (e.clientX / innerWidth) * 2 - 1; ndc.y = -(e.clientY / innerHeight) * 2 + 1;
  }, { passive: true });

  const VERT = `#version 300 es
    in vec2 aPos; out vec2 vUv;
    void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;
  const FRAG = `#version 300 es
    precision highp float;
    in vec2 vUv; out vec4 outColor;
    uniform vec2 uSize, uAt, uGhost;
    uniform float uR, uF, uGain, uRows, uMosaic, uStepped, uBase, uLight, uDim, uTime, uScan, uStain, uSeed, uVeil;
    uniform vec3 uPal[7];
    const float EDGE[6] = float[6](0.15, 0.3, 0.5, 0.7, 0.875, 0.975);
    const float SOFT[6] = float[6](0.05, 0.1, 0.1, 0.1, 0.075, 0.025);
    const float LEVEL[5] = float[5](0.1, 0.25, 0.45, 0.65, 0.85);
    float cover(vec2 uv) {
      vec2 d = (uv - uAt) * vec2(uSize.x / uSize.y, 1.0);
      float a = 1.0 - smoothstep(uR - uF, uR + uF, length(d));
      float b = 1.0 - smoothstep(uR - uF, uR + uF, length(d - uGhost));
      return clamp(uGain * (a + 0.5 * b), 0.0, 1.0);
    }
    float rnd(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 15731.743); }
    float vnoise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(rnd(i), rnd(i + vec2(1.0, 0.0)), f.x), mix(rnd(i + vec2(0.0, 1.0)), rnd(i + 1.0), f.x), f.y);
    }
    float ground(vec2 uv) {
      if (uStain < 0.001) return uBase;
      vec2 p = (uv * 2.0 - 1.0) * vec2(uSize.x / uSize.y, 1.0) * 250.0 + uTime * 0.1 * vec2(1.0, 0.7) + uSeed;
      float n = vnoise(p) * 0.5 + vnoise(p * 2.0) * 0.25;
      return uBase + n * n * 0.5 * uStain;
    }
    float lift(float m, float b) { return b + (1.0 - b) * m; }
    float bands(float v) { float q = 0.1; for (int i = 0; i < 5; i++) if (v >= LEVEL[i]) q = 0.2 * float(i + 1); return q; }
    vec3 tint(float h) {
      vec3 c = uPal[0];
      for (int i = 0; i < 6; i++) c = mix(c, uPal[i + 1], uStepped > 0.5 ? step(EDGE[i], h) : smoothstep(EDGE[i] - SOFT[i], EDGE[i] + SOFT[i], h));
      return c;
    }
    void main() {
      vec2 grid = vec2(uRows * uSize.x / uSize.y, uRows);
      vec2 cell = (floor(vUv * grid) + 0.5) / grid;
      float ms = cover(vUv), mc = cover(cell);
      float hc = bands(lift(mc, ground(cell)));
      float h = mix(lift(ms, uBase), hc, uMosaic);
      float a = uVeil * (uStepped > 0.5 ? step(bands(uBase) + 0.01, hc) : smoothstep(0.0, 0.08, mix(ms, mc, uMosaic)));
      vec3 col = mix(tint(h), vec3(0.5 + 0.5 * uScan * sin(gl_FragCoord.x * 2.5 - uTime * 5.0)), 0.1) * uLight;
      outColor = vec4(col * a, a + uDim * (1.0 - a));
    }`;

  const glCanvas = document.createElement("canvas");
  const gl = glCanvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false });
  let prog = null, loc = {};
  if (gl) {
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.bindAttribLocation(prog, 0, "aPos");
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) prog = null;
  }
  if (prog) {
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    for (const n of ["uSize", "uAt", "uGhost", "uR", "uF", "uGain", "uRows", "uMosaic", "uStepped", "uBase", "uLight", "uDim", "uTime", "uScan", "uStain", "uSeed", "uVeil", "uPal"]) loc[n] = gl.getUniformLocation(prog, n);
    // Draw once when building so the driver compile is finished — compiling for the first time on the first cursor move would freeze the screen
    glCanvas.width = glCanvas.height = 1;
    gl.viewport(0, 0, 1, 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.finish();
  }

  // The seven color bands are the panel’s CSS variables --et-h1…7 (mixed from the skin) — painted on a 1px canvas to read rgb, so oklch and color-mix are read too
  const pad = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgb = (el, name) => {
    const probe = document.createElement("span");
    probe.style.cssText = `position:absolute;visibility:hidden;color:var(${name})`;
    el.append(probe);
    pad.canvas.width = pad.canvas.height = 1;
    pad.fillStyle = getComputedStyle(probe).color;
    probe.remove();
    pad.fillRect(0, 0, 1, 1);
    const [r, g, b] = pad.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255];
  };

  const panes = prog ? [...document.querySelectorAll("canvas[data-et-heat]")].filter((c) => PRESET[c.dataset.etHeat]).map((cv) => {
    const p = { cv, ctx: cv.getContext("2d"), veil: 1, ...PRESET[cv.dataset.etHeat], dim: 0, stain: 0, seed: Math.random() * 1000, sx: -9, sy: -9, seen: false, drawn: false, w: 0, h: 0 };
    p.pal = new Float32Array([1, 2, 3, 4, 5, 6, 7].flatMap((i) => rgb(cv, `--et-h${i}`)));
    return p;
  }) : [];
  const size = () => {
    const dpr = Math.min(devicePixelRatio, 1.5);
    let mw = 1, mh = 1;
    for (const p of panes) {
      p.w = Math.max(1, Math.round(p.cv.clientWidth * dpr)); p.h = Math.max(1, Math.round(p.cv.clientHeight * dpr));
      if (p.cv.width !== p.w || p.cv.height !== p.h) { p.cv.width = p.w; p.cv.height = p.h; p.drawn = false; }
      mw = Math.max(mw, p.w); mh = Math.max(mh, p.h);
    }
    if (gl && (glCanvas.width < mw || glCanvas.height < mh)) { glCanvas.width = Math.max(glCanvas.width, mw); glCanvas.height = Math.max(glCanvas.height, mh); }
  };
  const draw = (p, t, gx, gy) => {
    gl.viewport(0, 0, p.w, p.h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(loc.uSize, p.w, p.h);
    gl.uniform2f(loc.uAt, p.sx, 1 - p.sy);
    gl.uniform2f(loc.uGhost, gx, gy);
    gl.uniform1f(loc.uR, p.r); gl.uniform1f(loc.uF, p.f); gl.uniform1f(loc.uGain, p.gain);
    gl.uniform1f(loc.uRows, p.rows()); gl.uniform1f(loc.uMosaic, p.mosaic); gl.uniform1f(loc.uStepped, p.stepped);
    gl.uniform1f(loc.uBase, p.base); gl.uniform1f(loc.uLight, p.light); gl.uniform1f(loc.uDim, p.dim); gl.uniform1f(loc.uTime, t);
    gl.uniform1f(loc.uScan, p.scan); gl.uniform1f(loc.uStain, p.stain); gl.uniform1f(loc.uSeed, p.seed); gl.uniform1f(loc.uVeil, p.veil);
    gl.uniform3fv(loc.uPal, p.pal);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    p.ctx.clearRect(0, 0, p.w, p.h);
    p.ctx.drawImage(glCanvas, 0, glCanvas.height - p.h, p.w, p.h, 0, 0, p.w, p.h);
    p.drawn = true;
  };

  // Hero threat tag — on hover the circle grows and the photo darkens (brightness .55 → .35 as a relative value: circle .35/.55, photo gets a black overlay of 1 − .35/.55)
  const hero = panes.find((p) => p.cv.dataset.etHeat === "bitmap");
  if (hero) document.querySelectorAll(".et-tag").forEach((tag) => {
    const to = (v, d, ease) => (window.gsap ? gsap.to(hero, { ...v, duration: d, ease, overwrite: true }) : Object.assign(hero, v));
    tag.addEventListener("pointerenter", () => to({ r: 0.1, light: 0.35 / 0.55, dim: 1 - 0.35 / 0.55 }, 0.4, "power2.out"));
    tag.addEventListener("pointerleave", () => to({ r: 0.05, light: 1, dim: 0 }, 0.5, "power2.inOut"));
  });
  panes.filter((p) => p.cv.dataset.etHeat === "card").forEach((p) => {
    const card = p.cv.closest(".et-card") || p.cv.parentElement;
    const to = (v, d) => (window.gsap ? gsap.to(p, { ...v, duration: d, overwrite: "auto" }) : Object.assign(p, v));
    card.addEventListener("pointerenter", () => { to({ gain: 1 }, 0.8); to({ stain: 1 }, 0.7); });
    card.addEventListener("pointerleave", () => { to({ gain: 0 }, 0.25); to({ stain: 0 }, 5); });
  });

  const foot = document.querySelector(".et-foot");
  const tunnel = foot?.querySelector('[data-fx~="pixel-scan-gl"]');
  const tilt = { x: 0, y: 0, seen: false };
  if (tunnel) tunnel.classList.add("et-tilt");

  let raf = 0, last = 0, t = 0;
  const frame = (now) => {
    raf = 0;
    const live = panes.filter((p) => p.seen);
    if (!live.length && !tilt.seen) { last = 0; return; }
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
    last = now; t += dt;
    const follow = 1 - Math.pow(1 - 0.08, dt * 60);
    const gx = (Math.sin(t * 1.1) * 0.5 + Math.sin(t * 2.3 + 1.7) * 0.25) * 0.02, gy = (Math.sin(t * 1.3) * 0.5 + Math.sin(t * 2.1 + 2.3) * 0.25) * 0.02;
    for (const p of live) {
      const r = p.cv.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const tx = (mouse.x - r.left) / r.width, ty = (mouse.y - r.top) / r.height;
      if (p.sx < -8) { p.sx = tx; p.sy = ty; }
      p.sx += (tx - p.sx) * follow; p.sy += (ty - p.sy) * follow;
      const reach = p.r + p.f + 0.03, ax = reach * r.height / r.width;
      const near = p.sx > -ax && p.sx < 1 + ax && p.sy > -reach && p.sy < 1 + reach;
      if (near || p.dim > 0.001 || p.stain > 0.001) draw(p, t, gx, gy);
      else if (p.drawn) { p.ctx.clearRect(0, 0, p.w, p.h); p.drawn = false; }
    }
    if (tilt.seen) {
      const r = foot.getBoundingClientRect();
      if (r.top < innerHeight) { const k = 1 - Math.pow(1 - 0.02, dt * 60); tilt.x += (ndc.x - tilt.x) * k; tilt.y += (ndc.y - tilt.y) * k; }
      tunnel.style.transform = `translate(${(-tilt.x * 0.025 * r.width).toFixed(2)}px, ${(tilt.y * 0.025 * r.height).toFixed(2)}px)`;
    }
  };
  const wake = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const io = new IntersectionObserver((list) => {
    for (const e of list) {
      if (e.target === tunnel) tilt.seen = e.isIntersecting;
      const p = panes.find((x) => x.cv === e.target);
      if (p) { p.seen = e.isIntersecting; if (!p.seen && p.drawn) { p.ctx.clearRect(0, 0, p.w, p.h); p.drawn = false; } }
    }
    wake();
  });
  panes.forEach((p) => io.observe(p.cv));
  if (tunnel) io.observe(tunnel);
  if (panes.length) { const ro = new ResizeObserver(size); panes.forEach((p) => ro.observe(p.cv)); size(); }
})();
