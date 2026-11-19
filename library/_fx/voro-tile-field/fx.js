(() => {
  // Tens of thousands of small poster cells fill the screen, divided by a WebGL2 weighted Voronoi, with a fisheye lens in the center — inside the lens cells are pulled large in their original colors, and at the edge they become bands pressed toward the diameter,
  // Outside the lens the board is dimmed in two tones of black and white with a ripple running. The board shifts by as much as the cursor moves (follow .15 · max 10px/frame) so other cells pass under the lens, and the center cell becomes the focus, gaining weight and growing.
  // Cell positions are grid plus jitter and are re-placed every frame by forces (pull to grid .8, focus pushing neighbors away .3, velocity damping .7, alpha .2).
  // Rebuilt by measuring a reference piece from Brand — the original shaders and code were not used.
  const VS = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0., 1.); }`;

  const FS = `#version 300 es
precision highp float;
precision highp int;
uniform vec2 uRes;
uniform float uDpr;
uniform float uTime;
uniform vec2 uCam;
uniform float uZoom;
uniform vec2 uCell;
uniform ivec2 uGrid;
uniform highp sampler2D uPos;
uniform int uFocus;
uniform vec2 uLens;
uniform vec2 uLensR;
uniform float uMag;
uniform float uRipple;
uniform float uGap;
uniform float uRound;
uniform float uWeightK;
uniform float uFade;
uniform float uDim;
uniform float uLensOn;
uniform vec3 uDark;
uniform vec3 uLight;
uniform vec3 uBg;
out vec4 outColor;

vec4 cellAt(ivec2 c, out int idx) {
  ivec2 g = uGrid;
  ivec2 m = ivec2((c.x % g.x + g.x) % g.x, (c.y % g.y + g.y) % g.y);
  idx = m.y * g.x + m.x;
  vec4 d = texelFetch(uPos, m, 0);
  d.xy += vec2(c - m) * uCell;
  return d;
}
float hash(float n) { return fract(sin(n * 91.3458) * 47453.5453); }
float smin(float a, float b, float k) {
  float h = clamp(.5 + .5 * (b - a) / k, 0., 1.);
  return mix(b, a, h) - k * h * (1. - h);
}
vec3 hsv(float h, float s, float v) {
  vec3 k = clamp(abs(mod(h * 6. + vec3(0., 4., 2.), 6.) - 3.) - 1., 0., 1.);
  return v * mix(vec3(1.), k, s);
}
// Poster slot: seed-picked background color + light that deepens from top to bottom + big center shape + top·bottom title bands
vec3 poster(vec2 uv, float seed) {
  float h = hash(seed);
  vec3 base = hsv(h, .35 + .45 * hash(seed + 1.), .25 + .5 * hash(seed + 2.));
  vec3 sky = hsv(fract(h + .06), .25 + .3 * hash(seed + 5.), .55 + .4 * hash(seed + 6.));
  vec3 col = mix(sky, base, smoothstep(.15, .95, uv.y));
  vec2 q = uv - vec2(.5 + .15 * (hash(seed + 3.) - .5), .5 + .12 * hash(seed + 7.));
  float kind = hash(seed + 4.);
  float shape = kind > .66 ? length(q * vec2(1., .8)) : kind > .33 ? max(abs(q.x) * 1.4, abs(q.y)) : length(q * vec2(1.6, .55));
  col = mix(col, hsv(fract(h + .5), .45, .2 + .7 * hash(seed + 8.)), (1. - smoothstep(.2, .23, shape)) * .85);
  float top = step(.06, uv.y) * step(uv.y, .16 + .06 * hash(seed + 9.)) * step(.14, uv.x) * step(uv.x, .86);
  float bot = step(.82, uv.y) * step(uv.y, .88) * step(.2, uv.x) * step(uv.x, .8);
  col = mix(col, vec3(.96), max(top * step(.5, hash(seed + 10.)), bot) * .9);
  return col;
}
void main() {
  vec2 s = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  vec2 view = uRes / uDpr;
  // Fisheye lens: r<Inside 1 it is pulled by k + (1-k)r² so the center grows 1/k times and the edge is pressed toward the diameter. Outside 1<r<2 is a ripple (frequency 30 · speed 2 · strength .02)
  vec2 d = s - uLens;
  float r = length(d / uLensR);
  float f = 1.;
  if (r < 1.) {
    float k = 1. / max(uMag, 1.);
    f = k + (1. - k) * r * r;
  } else if (r < 2.) {
    f = 1. + sin(30. * r - uTime * 2.) * .02 * (r - 2.) * (r - 2.) * uRipple;
  }
  vec2 p = uCam + (uLens + d * f - view * .5) / uZoom;
  ivec2 c = ivec2(floor(p / uCell));
  float d1 = 1e9; int i1 = -1; vec4 c1 = vec4(0.);
  float cdist[25];
  int n = 0;
  for (int y = -2; y <= 2; y++) for (int x = -2; x <= 2; x++) {
    int idx; vec4 cd = cellAt(c + ivec2(x, y), idx);
    vec2 o = (p - cd.xy) / uCell;
    float dist = length(o) - cd.z * uWeightK;
    cdist[n] = dist; n++;
    if (dist < d1) { d1 = dist; i1 = idx; c1 = cd; }
  }
  float edge = 1e9;
  for (int k = 0; k < 25; k++) {
    float e = (cdist[k] - d1) * .5;
    if (e > .0005) edge = smin(edge, e, uRound);
  }
  float aa = max(fwidth(edge), 1e-4);
  float inside = smoothstep(uGap - aa, uGap + aa, edge);
  float grow = 1. + c1.z * uWeightK * 2.;
  vec2 uv = clamp((p - c1.xy) / (uCell * grow) * vec2(1.05, 1.05) + .5, 0., 1.);
  vec3 col = poster(uv, c1.w * 997.);
  // When the lens stands, only inside the lens keeps the original color, outward it darkens into two-tone grayscale (original GRAYSCALE_DUOTONE) — during the intro everything is in original color
  float lum = dot(col, vec3(.2125, .7154, .0721));
  vec3 duo = mix(uDark, uLight, lum) * uDim;
  float colorAmt = mix(1., 1. - smoothstep(.72, 1.05, r), uLensOn);
  col = mix(duo, col, colorAmt);
  col = mix(uBg, col, inside * uFade);
  outColor = vec4(col, 1.);
}`;

  // Paints skin variables (including color mixes and oklch) and reads them back as rgb — getPropertyValue returns the text without resolving color-mix
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgbOf = (el, v, fb) => {
    const t = document.createElement("i");
    t.style.cssText = `position:absolute;visibility:hidden;color:var(${v}, var(${fb}))`;
    el.appendChild(t);
    const c = getComputedStyle(t).color;
    t.remove();
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = c;
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  kfFx.register("voro-tile-field", (el, { options, reduce }) => {
    const canvas = el.querySelector('[data-fx-part="canvas"]') || el.appendChild(document.createElement("canvas"));
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
    if (!gl) { el.classList.add("is-nogl"); return; }
    const cellW = +options.cell || 7;
    const aspect = +options.aspect || 1.5;
    const cols = +options.cols || 240, rows = +options.rows || 150;
    const jitter = +(options.jitter ?? 0.4);
    const maxSpeed = +(options.speed ?? 10);
    const follow = +(options.ease ?? 0.15);
    const gain = +(options.gain ?? 0.3);
    const mag = +options.mag || 15;
    const lensR = +options.lens || 0.25;
    const ripple = +(options.ripple ?? 1);
    const pushK = +(options.push ?? 0.3), latticeK = +(options.lattice ?? 0.8), decay = +(options.decay ?? 0.7);
    const introDur = +(options.intro ?? 3.2);
    const joltK = +options.jolt || 7, joltMin = 2, shakeMin = 2, shakeN = +options.shakes || 3, shakeWin = 250, shakeCool = 2000, attachMax = 5, attachR = 50;
    const cell = [cellW, cellW * aspect];

    const prog = gl.createProgram();
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s)); gl.attachShader(prog, s); return s; };
    const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {};
    for (const n of ["uRes", "uDpr", "uTime", "uCam", "uZoom", "uCell", "uGrid", "uPos", "uFocus", "uLens", "uLensR", "uMag", "uRipple", "uGap", "uRound", "uWeightK", "uFade", "uDim", "uLensOn", "uDark", "uLight", "uBg"]) U[n] = gl.getUniformLocation(prog, n);

    const N = cols * rows;
    const home = new Float32Array(N * 2), pos = new Float32Array(N * 2), vel = new Float32Array(N * 2);
    const weight = new Float32Array(N), data = new Float32Array(N * 4);
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      home[i * 2] = (x + 0.5 + (rnd() - 0.5) * jitter) * cell[0];
      home[i * 2 + 1] = (y + 0.5 + (rnd() - 0.5) * jitter) * cell[1];
      pos[i * 2] = home[i * 2]; pos[i * 2 + 1] = home[i * 2 + 1];
      data[i * 4] = pos[i * 2]; data[i * 4 + 1] = pos[i * 2 + 1];
      data[i * 4 + 3] = rnd();
    }
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, cols, rows, 0, gl.RGBA, gl.FLOAT, data);

    const W = cols * cell[0], H = rows * cell[1];
    const st = {
      base: [W / 2, H / 2], cam: [W / 2, H / 2], target: [W / 2, H / 2],
      zoom: 1, ptr: null, focus: -1, select: 0, selectT: 0, wheel: 0,
      introStart: 0, fade: 0, lens: 0, last: 0, t0: performance.now(),
      frozen: null, down: false, lastRaw: null, rawHist: [], avgRaw: 0,
    };
    el.voroField = st;
    let colors = { bg: rgbOf(el, "--fx-bg", "--kf-bg"), dark: rgbOf(el, "--fx-duo-dark", "--kf-raised"), light: rgbOf(el, "--fx-duo-light", "--kf-dim") };

    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const r = el.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      st.view = [r.width || 1, r.height || 1]; st.dpr = dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);

    const nearest = (wx, wy) => {
      const cx = Math.floor(wx / cell[0]), cy = Math.floor(wy / cell[1]);
      let best = 0, bd = 1e12;
      for (let y = -1; y <= 1; y++) for (let x = -1; x <= 1; x++) {
        const gx = cx + x, gy = cy + y;
        const mx = ((gx % cols) + cols) % cols, my = ((gy % rows) + rows) % rows;
        const i = my * cols + mx;
        const px = pos[i * 2] + (gx - mx) * cell[0], py = pos[i * 2 + 1] + (gy - my) * cell[1];
        const d = Math.hypot((wx - px) / cell[0], (wy - py) / cell[1]) - weight[i] * 0.35;
        if (d < bd) { bd = d; best = i; }
      }
      return best;
    };
    const emit = (type, detail) => el.dispatchEvent(new CustomEvent(type, { detail }));
    const setSelect = (on) => {
      if (!!st.selectT === on) return;
      st.selectT = on ? 1 : 0;
      emit("fx:voro-select", { selected: on, index: st.focus });
    };

    // The panel is pushed by how far the cursor moves — the target is the distance off center × gain, with follow ease and a max of maxSpeed (4 · .1 in the picker view).
    // As in the original, the cursor either jolts (jolt: frame movement > average of the last 10 frames (min 2px) × 7) if direction changes three times within 250ms (shake, 2s rest) the cursor freezes and the panel stops,
    // Frozen even after leaving the panel. To reattach, bring it slowly to within 50px of the frozen spot at under 5px per frame on average
    const aimAt = (pt) => { st.target = [st.base[0] + (pt[0] - st.view[0] / 2) * gain, st.base[1] + (pt[1] - st.view[1] / 2) * gain]; };
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      st.ptr = [e.clientX - r.left, e.clientY - r.top];
    };
    const onLeave = () => { if (!st.frozen && st.ptr) st.frozen = st.ptr.slice(); };
    const onDown = () => { st.down = true; };
    const onUp = () => { st.down = false; };
    const shake = { x: null, y: null, nx: 0, ny: 0, timer: 0, cool: false };
    const resetShake = () => { shake.x = shake.y = null; shake.nx = shake.ny = 0; };
    const detach = (rs, rx, ry) => {
      if (rs > Math.max(st.avgRaw, joltMin) * joltK) return true;
      if (rs <= shakeMin) { resetShake(); return false; }
      const dx = rx > 0 ? 1 : rx < 0 ? -1 : 0, dy = ry > 0 ? 1 : ry < 0 ? -1 : 0;
      const turn = () => { clearTimeout(shake.timer); shake.timer = setTimeout(resetShake, shakeWin); };
      if (shake.x && dx && dx !== shake.x) { shake.nx++; turn(); }
      if (shake.y && dy && dy !== shake.y) { shake.ny++; turn(); }
      shake.x = dx || shake.x; shake.y = dy || shake.y;
      if ((shake.nx >= shakeN || shake.ny >= shakeN) && !shake.cool) {
        resetShake(); shake.cool = true; setTimeout(() => (shake.cool = false), shakeCool);
        return true;
      }
      return false;
    };
    // Scroll the wheel up to approach the picker view, down to back away
    const onWheel = (e) => { if (st.lens < 1) return; setSelect(e.deltaY < 0); };
    const onClick = () => { if (st.lens >= 1) setSelect(!st.selectT); };
    const onKey = (e) => {
      if (st.lens < 1) return;
      if (e.key === "Escape") setSelect(false);
      const step = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (step) { st.base[0] += step[0] * cell[0]; st.base[1] += step[1] * cell[1]; st.target[0] += step[0] * cell[0]; st.target[1] += step[1] * cell[1]; }
    };
    const onIntro = () => { st.introStart = performance.now(); st.selectT = 0; };
    const onTheme = () => { colors = { bg: rgbOf(el, "--fx-bg", "--kf-bg"), dark: rgbOf(el, "--fx-duo-dark", "--kf-raised"), light: rgbOf(el, "--fx-duo-light", "--kf-dim") }; };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onDown);
    addEventListener("pointerup", onUp);
    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("click", onClick);
    el.addEventListener("fx:voro-intro", onIntro);
    addEventListener("keydown", onKey);
    addEventListener("fx:theme", onTheme);
    if (options.start === "now") onIntro();

    let raf = 0;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(3, Math.max(1, (now - (st.last || now)) / 16.67));
      st.last = now;
      const [vw, vh] = st.view;
      // Intro: the big poster cell fills the screen (about 11×) and floats up, steps back to 1× during introDur, then the lens swells in 1s
      const it = st.introStart ? (reduce ? 99 : (now - st.introStart) / 1000) : -1;
      st.fade = it < 0 ? 0 : Math.min(1, it / 0.4);
      const zt = it < 0 ? 0 : Math.min(1, it / introDur);
      const introZoom = 1 + 10 * (1 - ease(zt));
      st.lens = it < 0 ? 0 : Math.min(1, Math.max(0, (it - introDur * 0.7) / 1));
      st.select += (st.selectT - st.select) * 0.1 * dt;

      // Measures cursor movement per frame to tell freezing from re-attaching
      if (st.ptr && st.lens >= 1) {
        let rs = 0, rx = 0, ry = 0;
        if (st.lastRaw) {
          rx = st.ptr[0] - st.lastRaw[0]; ry = st.ptr[1] - st.lastRaw[1]; rs = Math.hypot(rx, ry);
          st.rawHist.push(rs);
          if (st.rawHist.length > 10) { st.rawHist.shift(); st.avgRaw = st.rawHist.reduce((a, b) => a + b, 0) / st.rawHist.length; }
        }
        st.lastRaw = st.ptr.slice();
        if (!st.frozen && !st.down && detach(rs, rx, ry)) st.frozen = (st.prevPtr || st.ptr).slice();
        else if (st.frozen && rs >= 0.1 && st.avgRaw < attachMax && Math.hypot(st.ptr[0] - st.frozen[0], st.ptr[1] - st.frozen[1]) < attachR) st.frozen = null;
        if (!st.frozen) { st.prevPtr = st.ptr.slice(); aimAt(st.ptr); }
      }
      const sp = st.selectT ? 4 : maxSpeed, fo = st.selectT ? 0.1 : follow;
      if (st.lens >= 1 && !reduce) {
        let dx = (st.target[0] - st.cam[0]) * fo * dt, dy = (st.target[1] - st.cam[1]) * fo * dt;
        const m = Math.hypot(dx, dy), cap = sp * dt / mag;
        if (m > cap) { dx *= cap / m; dy *= cap / m; }
        st.cam[0] += dx; st.cam[1] += dy;
      }
      st.zoom = introZoom;
      const focus = nearest(st.cam[0], st.cam[1]);
      if (focus !== st.focus && st.lens > 0.5) emit("fx:voro-focus", { index: focus, seed: data[focus * 4 + 3] });
      st.focus = focus;

      const alpha = 0.2;
      const fx = pos[focus * 2], fy = pos[focus * 2 + 1];
      const R = 2.6;
      for (let i = 0; i < N; i++) {
        const tw = i === focus ? (1 + st.select * 0.6) * st.lens : 0;
        weight[i] += (tw - weight[i]) * 0.15 * dt;
        let ax = (home[i * 2] - pos[i * 2]) * latticeK * alpha;
        let ay = (home[i * 2 + 1] - pos[i * 2 + 1]) * latticeK * alpha;
        if (i !== focus && weight[focus] > 0.01) {
          let dx = (pos[i * 2] - fx) / cell[0], dy = (pos[i * 2 + 1] - fy) / cell[1];
          dx -= Math.round(dx / cols) * cols; dy -= Math.round(dy / rows) * rows;
          const dd = Math.hypot(dx, dy);
          if (dd < R && dd > 0.001) { const k = (1 - dd / R) * pushK * alpha * weight[focus]; ax += (dx / dd) * k * cell[0]; ay += (dy / dd) * k * cell[1]; }
        }
        vel[i * 2] = (vel[i * 2] + ax) * (1 - decay);
        vel[i * 2 + 1] = (vel[i * 2 + 1] + ay) * (1 - decay);
        pos[i * 2] += vel[i * 2] * dt; pos[i * 2 + 1] += vel[i * 2 + 1] * dt;
        data[i * 4] = pos[i * 2]; data[i * 4 + 1] = pos[i * 2 + 1]; data[i * 4 + 2] = weight[i];
      }
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, cols, rows, gl.RGBA, gl.FLOAT, data);

      const R0 = Math.min(vw, vh) * lensR * (1 + st.select * 0.9);
      const le = ease(st.lens);
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
      gl.uniform1f(U.uDpr, st.dpr);
      gl.uniform1f(U.uTime, (now - st.t0) / 1000);
      gl.uniform2f(U.uCam, st.cam[0], st.cam[1]);
      gl.uniform1f(U.uZoom, st.zoom);
      gl.uniform2f(U.uCell, cell[0], cell[1]);
      gl.uniform2i(U.uGrid, cols, rows);
      gl.uniform1i(U.uPos, 0);
      gl.uniform1i(U.uFocus, focus);
      gl.uniform2f(U.uLens, vw / 2, vh / 2);
      gl.uniform2f(U.uLensR, R0 * 1.12 * Math.max(le, 0.001), R0 * Math.max(le, 0.001));
      gl.uniform1f(U.uMag, 1 + (mag * (1 + st.select * 0.7) - 1) * le);
      gl.uniform1f(U.uRipple, ripple * le);
      gl.uniform1f(U.uGap, 0.045);
      gl.uniform1f(U.uRound, 0.12);
      gl.uniform1f(U.uWeightK, 0.35);
      gl.uniform1f(U.uFade, st.fade);
      gl.uniform1f(U.uDim, 0.4);
      gl.uniform1f(U.uLensOn, le);
      gl.uniform3fv(U.uDark, colors.dark);
      gl.uniform3fv(U.uLight, colors.light);
      gl.uniform3fv(U.uBg, colors.bg);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    // Shaders are drawn once and precompiled when set up — so the first cursor move doesn’t stall
    frame(performance.now());
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
      removeEventListener("pointerup", onUp);
      clearTimeout(shake.timer);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("click", onClick);
      el.removeEventListener("fx:voro-intro", onIntro);
      removeEventListener("keydown", onKey);
      removeEventListener("fx:theme", onTheme);
      gl.deleteTexture(tex); gl.deleteBuffer(buf); gl.deleteShader(vs); gl.deleteShader(fs); gl.deleteProgram(prog);
      delete el.voroField;
    };
  });
})();
