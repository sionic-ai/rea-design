// Spanning the whole site — the loading entrance (particles gather over a water-column shader to form the percent number), the sound button (bars bounce to the sound), and the motion button.
// Colors are read from the skin (variables in theme.css and shared.css).
(() => {
  const css = (name, el = document.documentElement) => getComputedStyle(el).getPropertyValue(name).trim();
  // Paint variable values (including oklch(from …)) onto a canvas and read them as 0–1 rgb
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  probe.canvas.width = probe.canvas.height = 1;
  const holder = document.createElement("i");
  holder.style.display = "none";
  document.documentElement.append(holder);
  function rgbOf(varName) {
    holder.style.color = `var(${varName})`;
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = getComputedStyle(holder).color;
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  }
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const GLYPH_POOL = "LOGTYPE0#/+×";

  // ── Loading entrance ──────────────────────────────────
  const SEA_V = `attribute vec2 position; varying vec2 vUv; void main(){ vUv = position * 0.5 + 0.5; gl_Position = vec4(position, 0.0, 1.0); }`;
  const SEA_F = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform float uDepth; uniform float uExit;
uniform vec3 uShallow; uniform vec3 uMid; uniform vec3 uDeep; uniform vec3 uLight;
varying vec2 vUv;
float h21(vec2 p){ p = fract(p * vec2(233.34, 851.73)); p += dot(p, p + 23.45); return fract(p.x * p.y); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * vn(p); p = p * 2.03 + 1.7; a *= 0.5; } return s; }
void main(){
  vec2 uv = vUv; float asp = uRes.x / uRes.y; vec2 p = vec2((uv.x - 0.5) * asp, uv.y);
  float d = clamp(uDepth + uExit * 0.25, 0.0, 1.0);
  // Water column: bright teal near the surface, deepening to a dark base further down
  vec3 top = mix(uShallow, uMid, smoothstep(0.0, 1.0, d));
  vec3 bot = mix(uMid * 0.42, uDeep, smoothstep(0.0, 0.9, d));
  vec3 col = mix(bot, top, pow(uv.y, 1.25));
  // Rippling light from the surface overhead — farther away as you sink
  float sY = 1.02 + d * 0.9;
  float near = smoothstep(0.35, 0.0, sY - uv.y);
  float rip = fbm(vec2(p.x * 2.4 + uTime * 0.05, uTime * 0.07));
  float web = smoothstep(0.62, 0.7, fbm(vec2(p.x * 5.5, p.x * 1.3 + uTime * 0.11) + rip * 1.6));
  col += uLight * near * (0.45 * rip + 0.55 * web) * (1.0 - d);
  // Light shafts falling diagonally from above
  float ang = atan(p.x + 0.25, 1.9 - uv.y);
  float shaft = fbm(vec2(ang * 7.0, uTime * 0.05)) * fbm(vec2(ang * 17.0 + 3.0, uTime * 0.03));
  col += uLight * 0.9 * pow(shaft, 1.6) * uv.y * 0.55 * (1.0 - d * 0.8);
  // Sea snow: three layers pass upward as much as they sink
  for (int k = 0; k < 3; k++) {
    float l = float(k), sc = 16.0 + l * 13.0;
    vec2 q = p * sc + vec2(0.0, -(uTime * (0.18 + l * 0.1) + uDepth * (5.0 + l * 6.0)));
    vec2 id = floor(q), f = fract(q) - 0.5; float h = h21(id);
    vec2 o = vec2(h21(id + 1.3), h21(id + 2.7)) - 0.5; o.x += sin(uTime * 0.4 + h * 20.0) * 0.12;
    float spk = smoothstep(0.09 + 0.05 * h, 0.0, length(f - o * 0.7)) * step(0.72, h);
    col += uLight * 1.1 * spk * (0.12 + l * 0.12);
  }
  col *= mix(1.0, smoothstep(1.35, 0.25, length((uv - 0.5) * vec2(asp, 1.0))), 0.55);
  col *= 1.0 - uExit * 0.35;
  gl_FragColor = vec4(col, 1.0);
}`;
  const DOT_V = `attribute vec2 position; attribute float seed; uniform vec2 uRes; uniform float uSize; varying float vSeed;
void main(){ vSeed = seed; vec2 c = position / uRes * 2.0 - 1.0; gl_Position = vec4(c.x, -c.y, 0.0, 1.0); gl_PointSize = uSize * (0.7 + seed * 0.6); }`;
  const DOT_F = `precision mediump float; uniform float uAlpha; uniform vec3 uInk; varying float vSeed;
void main(){ float a = smoothstep(0.5, 0.1, length(gl_PointCoord - 0.5)) * uAlpha * (0.75 + 0.25 * vSeed); gl_FragColor = vec4(uInk * a * 1.15, a); }`;

  // Draw digits 0~9 and pick the filled cells as dots — particles gather at these dots to form the percent.
  function sampleDigits() {
    const size = 260, cv = document.createElement("canvas"), g = cv.getContext("2d", { willReadFrequently: true });
    cv.width = cv.height = size + 40;
    const out = {};
    for (const ch of "0123456789") {
      g.clearRect(0, 0, cv.width, cv.height);
      g.font = `400 ${size}px ${css("--kf-font-display") || "serif"}`;
      g.textBaseline = "alphabetic";
      g.fillStyle = "white"; /* Not skin: invisible panel that cuts out a shape */
      g.fillText(ch, 4, size);
      const data = g.getImageData(0, 0, cv.width, cv.height).data, pts = [];
      for (let y = 0; y < cv.height; y += 2) for (let x = 0; x < cv.width; x += 2) if (data[(y * cv.width + x) * 4 + 3] > 128) pts.push(x / size, y / size - 0.12);
      out[ch] = { points: pts, advance: (g.measureText(ch).width / size) * 0.94 };
    }
    return out;
  }

  class Numerals {
    constructor(n) {
      this.count = n; this.pos = new Float32Array(n * 2); this.seed = new Float32Array(n);
      for (let i = 0; i < n; i++) { this.seed[i] = Math.random(); this.pos[i * 2] = Math.random(); this.pos[i * 2 + 1] = Math.random(); }
      this.text = ""; this.targets = null; this.glyphs = null; this.scattered = false;
    }
    layout(text, w, h) {
      const G = this.glyphs, chars = [...text].filter((c) => G[c]);
      if (!chars.length) return;
      const ref = G["1"].advance + G["0"].advance * 2, size = Math.min(h * 0.28, (w * 0.78) / ref);
      const total = chars.reduce((s, c) => s + G[c].advance, 0) * size;
      let x = w / 2 - total / 2;
      const slots = chars.map((c) => { const s = { g: G[c], x, y: h * 0.5 - size * 0.5 }; x += G[c].advance * size; return s; });
      const t = this.targets && this.targets.length === this.count * 2 ? this.targets : new Float32Array(this.count * 2);
      for (let i = 0; i < this.count; i++) {
        const s = slots[i % slots.length], pts = s.g.points, k = ((Math.floor(i / slots.length) * 7919) % (pts.length / 2)) | 0;
        t[i * 2] = s.x + pts[k * 2] * size; t[i * 2 + 1] = s.y + pts[k * 2 + 1] * size;
      }
      this.targets = t; this.text = text; this.size = { w, h };
    }
    scatter(w, h) {
      this.scattered = true; this.size = { w, h };
      for (let i = 0; i < this.count; i++) { this.targets[i * 2] = Math.random() * w; this.targets[i * 2 + 1] = Math.random() * h; }
    }
    step(dt, time) {
      if (!this.targets) return;
      if (this.scattered) for (let i = 0; i < this.count; i++) {
        const j = i * 2 + 1;
        this.targets[j] -= dt * (6 + this.seed[i] * 14);
        if (this.targets[j] < -10) { this.targets[j] += this.size.h + 20; this.pos[j] = this.targets[j]; }
      }
      const k = 1 - Math.exp(-dt * (this.scattered ? 1.6 : 7));
      for (let i = 0; i < this.count; i++) {
        const s = this.seed[i], wx = Math.sin(time * (1.1 + s) + i * 2.3) * 0.6, wy = Math.cos(time * (0.9 + s) + i * 1.7) * 0.6, o = i * 2;
        this.pos[o] += (this.targets[o] + wx - this.pos[o]) * k * (0.6 + s * 0.8);
        this.pos[o + 1] += (this.targets[o + 1] + wy - this.pos[o + 1]) * k * (0.6 + s * 0.8);
      }
    }
  }

  class Loader {
    constructor(root) {
      this.root = root;
      this.canvas = root.querySelector("[data-loader-motif]");
      this.countEl = root.querySelector("[data-loader-count]");
      this.depthEl = root.querySelector("[data-loader-depth]");
      this.partEl = root.querySelector("[data-loader-particles]");
      this.rule = root.querySelector("[data-loader-rule]");
      this.nameEl = root.querySelector("[data-loader-name]");
      this.total = 409600; this.target = 0; this.shown = 0; this.depth = 0; this.exit = 0; this.time = 0;
      this.startedAt = performance.now(); this.last = this.startedAt; this.running = true; this.completed = false; this.exiting = false;
      this.initGL(window.innerWidth < 760);
      this.resize = this.resize.bind(this);
      this.render = this.render.bind(this);
      this.resize();
      window.addEventListener("resize", this.resize);
      const glyphs = () => { if (this.numerals) this.numerals.glyphs = sampleDigits(); };
      glyphs();
      document.fonts?.ready.then(glyphs);
      requestAnimationFrame(this.render);
    }
    initGL(small) {
      const gl = this.canvas?.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
      if (!gl) return;
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
      const prog = (v, f) => { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, v)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, f)); gl.linkProgram(p); return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null; };
      this.sea = prog(SEA_V, SEA_F); this.dots = prog(DOT_V, DOT_F);
      if (!this.sea || !this.dots) return;
      this.gl = gl;
      this.tri = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.tri); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      this.numerals = new Numerals(small ? 2600 : 4400);
      this.posBuf = gl.createBuffer(); this.seedBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.seedBuf); gl.bufferData(gl.ARRAY_BUFFER, this.numerals.seed, gl.STATIC_DRAW);
      this.u = Object.fromEntries(["uRes", "uTime", "uDepth", "uExit", "uShallow", "uMid", "uDeep", "uLight"].map((n) => [n, gl.getUniformLocation(this.sea, n)]));
      this.du = Object.fromEntries(["uRes", "uSize", "uAlpha", "uInk"].map((n) => [n, gl.getUniformLocation(this.dots, n)]));
      this.colors = { shallow: rgbOf("--kf-raised"), mid: rgbOf("--kf-surface"), deep: rgbOf("--site-deep"), light: rgbOf("--kf-accent-soft"), ink: rgbOf("--kf-ink") };
    }
    resize() {
      this.css = { w: window.innerWidth, h: window.innerHeight };
      const r = Math.min(window.devicePixelRatio || 1, 1.25) * 0.75;
      if (!this.canvas) return;
      this.canvas.width = Math.max(1, Math.round(this.css.w * r));
      this.canvas.height = Math.max(1, Math.round(this.css.h * r));
      this.gl?.viewport(0, 0, this.canvas.width, this.canvas.height);
      if (this.numerals && !this.numerals.scattered) this.numerals.text = "";
    }
    setProgress(v) { this.target = Math.max(this.target, Math.min(1, v)); }
    draw(dt) {
      const gl = this.gl;
      if (!gl) return;
      this.time += reduce ? 0 : dt;
      this.depth += (this.shown - this.depth) * (1 - Math.exp(-dt * 3));
      if (this.exiting) this.exit = Math.min(1, this.exit + dt / 0.9);
      const c = this.colors;
      gl.useProgram(this.sea);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.tri);
      const pa = gl.getAttribLocation(this.sea, "position");
      gl.enableVertexAttribArray(pa); gl.vertexAttribPointer(pa, 2, gl.FLOAT, false, 0, 0);
      gl.disable(gl.BLEND);
      gl.uniform2f(this.u.uRes, this.canvas.width, this.canvas.height);
      gl.uniform1f(this.u.uTime, this.time); gl.uniform1f(this.u.uDepth, this.depth); gl.uniform1f(this.u.uExit, this.exit);
      gl.uniform3fv(this.u.uShallow, c.shallow); gl.uniform3fv(this.u.uMid, c.mid); gl.uniform3fv(this.u.uDeep, c.deep); gl.uniform3fv(this.u.uLight, c.light);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      const n = this.numerals;
      if (!n?.glyphs) return;
      const text = String(Math.round(this.shown * 100));
      if (this.completed && !n.scattered) n.scatter(this.css.w, this.css.h);
      else if (!n.scattered && text !== n.text) n.layout(text, this.css.w, this.css.h);
      n.step(dt, this.time);
      gl.useProgram(this.dots);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      const pp = gl.getAttribLocation(this.dots, "position"), ps = gl.getAttribLocation(this.dots, "seed");
      gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuf); gl.bufferData(gl.ARRAY_BUFFER, n.pos, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(pp); gl.vertexAttribPointer(pp, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.seedBuf);
      gl.enableVertexAttribArray(ps); gl.vertexAttribPointer(ps, 1, gl.FLOAT, false, 0, 0);
      gl.uniform2f(this.du.uRes, this.css.w, this.css.h);
      gl.uniform1f(this.du.uSize, Math.max(1.8, 2.7 * (this.canvas.width / this.css.w)));
      gl.uniform1f(this.du.uAlpha, (1 - this.exit) * (n.scattered ? 0.5 : 1));
      gl.uniform3fv(this.du.uInk, c.ink);
      gl.drawArrays(gl.POINTS, 0, n.count);
      gl.disableVertexAttribArray(ps);
    }
    render(now) {
      if (!this.running) return;
      const dt = Math.min(0.5, Math.max(0, (now - this.last) / 1000));
      this.last = now;
      const time = reduce ? 1 : Math.min(1, (now - this.startedAt) / 1200);
      const want = Math.min(this.target, time);
      this.shown += (want - this.shown) * (1 - Math.exp(-dt * 7));
      if (want >= 1 && this.shown > 0.995) this.shown = 1;
      const pct = Math.round(this.shown * 100);
      if (this.countEl && this.countEl.textContent !== String(pct)) this.countEl.textContent = String(pct);
      this.root.setAttribute("aria-valuenow", String(pct));
      if (this.rule) this.rule.style.transform = `scaleX(${this.shown})`;
      if (this.depthEl) this.depthEl.textContent = Math.round(this.shown * 4000).toLocaleString("en-US");
      if (this.partEl) this.partEl.textContent = Math.round(this.shown * this.total).toLocaleString("en-US");
      if (this.nameEl && !reduce && this.shown < 1 && Math.random() < 0.2) this.nameEl.textContent = Array.from("XXXXXXXXXXXX", () => (Math.random() < 0.16 ? GLYPH_POOL[Math.floor(Math.random() * GLYPH_POOL.length)] : "X")).join("");
      this.draw(dt);
      if (this.shown >= 1 && !this.completed) {
        this.completed = true;
        if (this.nameEl) this.nameEl.textContent = "XXXXXXXXXXXX";
        this.onComplete?.();
      }
      requestAnimationFrame(this.render);
    }
    waitForChoice() {
      return new Promise((resolve) => {
        this.onComplete = () => {
          this.root.setAttribute("data-ready", "");
          const btns = [...this.root.querySelectorAll("[data-enter]")];
          btns[0]?.focus({ preventScroll: true });
          const pick = (e) => { btns.forEach((b) => b.removeEventListener("click", pick)); resolve(e.currentTarget.dataset.enter); };
          btns.forEach((b) => b.addEventListener("click", pick));
        };
        if (this.completed) this.onComplete();
      });
    }
    finish() {
      this.exiting = true;
      this.root.setAttribute("data-done", "");
      setTimeout(() => { this.running = false; window.removeEventListener("resize", this.resize); this.root.remove(); }, 1400);
    }
  }

  // Sound — the original plays a calm song at .18 volume. Instead of a song, a low ocean rumble is synthesized, with the same button and bar behavior
  class Sound {
    constructor(button) {
      this.button = button;
      this.label = button?.querySelector("[data-sound-label]");
      this.bars = [...(button?.querySelectorAll(".jb-toggle__bars i") || [])];
      this.ctx = null; this.playing = false; this.frame = 0;
      this.render = this.render.bind(this);
      button?.addEventListener("click", () => (this.playing ? this.pause() : this.play()));
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) { this.resume = this.playing; this.pause(); } else if (this.resume) { this.resume = false; this.play(); }
      });
    }
    ensure() {
      if (this.ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = (this.ctx = new AC());
      this.master = ctx.createGain(); this.master.gain.value = 0;
      this.analyser = ctx.createAnalyser(); this.analyser.fftSize = 64; this.analyser.smoothingTimeConstant = 0.8;
      this.data = new Uint8Array(this.analyser.frequencyBinCount);
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 520;
      [55, 82.4, 110.3, 164.8].forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
        o.type = i % 2 ? "triangle" : "sine"; o.frequency.value = f; g.gain.value = 0.22 / (i + 1);
        lfo.frequency.value = 0.07 + i * 0.05; lg.gain.value = 0.12 / (i + 1);
        lfo.connect(lg).connect(g.gain); o.connect(g).connect(lp); o.start(); lfo.start();
      });
      lp.connect(this.master); this.master.connect(this.analyser); this.analyser.connect(ctx.destination);
    }
    async play() {
      this.ensure();
      if (!this.ctx) return;
      try { await this.ctx.resume(); } catch { return; }
      this.master.gain.setTargetAtTime(0.18, this.ctx.currentTime, 0.4);
      this.playing = true; this.sync();
      if (!this.frame) this.frame = requestAnimationFrame(this.render);
    }
    pause() {
      if (this.ctx) this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15);
      this.playing = false; this.sync();
    }
    sync() {
      this.button?.setAttribute("aria-pressed", this.playing ? "true" : "false");
      if (this.label) this.label.textContent = this.playing ? "Sound on" : "Sound off";
    }
    render() {
      this.frame = 0;
      if (this.analyser) this.analyser.getByteFrequencyData(this.data);
      this.bars.forEach((b, i) => {
        const v = this.playing && this.data ? this.data[2 + i * 3] / 255 : 0;
        b.style.transform = `scaleY(${(0.2 + v * 0.8).toFixed(3)})`;
      });
      if (this.playing || this.bars.some((b) => b.style.transform !== "scaleY(0.200)")) this.frame = requestAnimationFrame(this.render);
    }
  }

  window.jbShared = { Loader, Sound, rgbOf, css, reduce };
})();
