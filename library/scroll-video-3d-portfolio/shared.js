// Shared by all scenes: curve names, Lenis, interaction state (rw), heart cursor and floating hearts, firefly loader, and a glass lens that lights up text near the cursor
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = matchMedia("(pointer: coarse)").matches;
  const root = document.documentElement;
  root.classList.toggle("rw-has-mark", !coarse && !reduce);

  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("press", "0.2,0.8,0.2,1");
  CustomEase.create("ooze", "0.22,1,0.36,1");
  CustomEase.create("jelly", "0.34,1.4,0.64,1");
  CustomEase.create("rack", "0.72,0,0.16,1");
  CustomEase.create("settle", "0.16,1,0.3,1");

  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const mix = (a, b, t) => a + (b - a) * t;
  const sstep = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const damp = (a, b, rate, dt) => mix(a, b, 1 - Math.exp(-rate * dt));

  // Interaction state — follows the mouse position (-1~1, up is +) with exponential easing at 14 per second, and collects speed · press · press count
  const rw = (window.rw = {
    reduce, coarse, clamp, mix, sstep, damp,
    px: 0, py: 0, rawX: 0, rawY: 0, pSpeed: 0, pressed: false, poked: false, tapSerial: 0,
    beeHover: false, dt: 1 / 60, t: 0, filmPct: 0, filmReady: false, sceneWarm: false,
    taps: [], drops: [],
  });
  const subs = new Set();
  rw.each = (fn) => { subs.add(fn); return () => subs.delete(fn); };
  rw.tap = (x, y) => { rw.taps.push({ x, y, born: performance.now() }); if (rw.taps.length > 6) rw.taps.shift(); };
  rw.drop = (x, y) => { if (rw.drops.length < 5) rw.drops.push({ x, y }); };

  // Skin variable → [r,g,b] (0~1). The canvas resolves oklch and color-mix too
  const probe = document.createElement("i");
  const pix = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  rw.color = (name) => {
    probe.style.color = `var(${name})`;
    document.body.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    pix.clearRect(0, 0, 1, 1);
    pix.fillStyle = c;
    pix.fillRect(0, 0, 1, 1);
    const d = pix.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  let tx = 0, ty = 0, lx = 0, ly = 0, last = performance.now();
  const setRaw = (e) => { tx = (e.clientX / innerWidth) * 2 - 1; ty = -((e.clientY / innerHeight) * 2 - 1); rw.rawX = tx; rw.rawY = ty; };
  addEventListener("pointermove", (e) => { setRaw(e); rw.poked = true; }, { passive: true });
  addEventListener("pointerdown", (e) => { setRaw(e); rw.pressed = true; rw.tapSerial++; rw.tap(tx, ty); }, { passive: true });
  addEventListener("pointerup", () => { rw.pressed = false; }, { passive: true });
  addEventListener("pointercancel", () => { rw.pressed = false; }, { passive: true });

  gsap.ticker.add(() => {
    const now = performance.now();
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    rw.dt = dt; rw.t = now / 1000;
    const nx = damp(rw.px, tx, 14, dt), ny = damp(rw.py, ty, 14, dt);
    const speed = Math.hypot(nx - lx, ny - ly) / dt;
    lx = nx; ly = ny; rw.px = nx; rw.py = ny;
    rw.pSpeed = damp(rw.pSpeed, clamp(0.42 * speed, 0, 1.6), 9, dt);
    for (const fn of subs) fn();
  });

  // Lenis — original 1.3.26, lerp .11, finger 1.4x
  if (!reduce && window.Lenis) {
    const lenis = new Lenis({ autoRaf: false, lerp: 0.11, smoothWheel: true, touchMultiplier: 1.4, anchors: true });
    rw.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Heart cursor — fills up to 1.25x over links, buttons and bees (accent color), and shrinks to .85x while pressed
  const heart = document.querySelector(".rw-heart");
  if (heart && !coarse && !reduce) {
    let overLink = false, hot = false;
    addEventListener("pointerover", (e) => { overLink = !!e.target.closest?.("a, button, [role=button]"); }, { passive: true });
    rw.each(() => {
      const x = ((rw.px + 1) / 2) * innerWidth, y = ((1 - rw.py) / 2) * innerHeight;
      const h = overLink || rw.beeHover;
      if (h !== hot) { hot = h; heart.classList.toggle("is-hot", hot); }
      const s = (hot ? 1.25 : 1) * (rw.pressed ? 0.85 : 1);
      heart.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${s})`;
    });
  }

  // Five rising hearts — on spawn they scale .4 → .85~1.15 in .18s, rise 30~40px over 1.05s (±9px sideways), and vanish in .55s starting at .5s
  const drops = [...document.querySelectorAll(".rw-drop")];
  const busy = drops.map(() => false);
  rw.each(() => {
    if (!rw.drops.length) return;
    for (const p of rw.drops.splice(0)) {
      const i = busy.indexOf(false);
      if (i < 0) return;
      busy[i] = true;
      const el = drops[i];
      const rise = 30 + 10 * Math.random(), side = (Math.random() - 0.5) * 18, sc = 0.85 + 0.3 * Math.random();
      gsap.killTweensOf(el);
      gsap.set(el, { x: p.x, y: p.y, xPercent: -50, yPercent: -50, opacity: 0, scale: 0.4 });
      gsap.timeline({ onComplete: () => { busy[i] = false; } })
        .to(el, { opacity: 1, scale: sc, duration: 0.18, ease: "press" }, 0)
        .to(el, { y: p.y - rise, x: p.x + side, duration: 1.05, ease: "settle" }, 0)
        .to(el, { opacity: 0, duration: 0.55, ease: "power1.in" }, 0.5);
    }
  });

  // Firefly loader — seven fireflies are born at 2.185s intervals, drift around the screen center (47%, 56% from the bottom) and blink at about .47Hz
  const loader = document.querySelector(".rw-loader");
  if (loader) {
    const pctEl = loader.querySelector("[data-loader-pct]");
    const cv = loader.querySelector(".rw-loader__flies");
    const gl = cv && cv.getContext("webgl2", { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: false });
    let raf = 0, alive = true;
    if (gl) {
      const vs = `#version 300 es
in vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;
      const fs = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec3 uCore; uniform vec3 uHalo; uniform vec3 uBg;
out vec4 outColor;
float hash(float n){ return fract(sin(n) * 43758.5453); }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / max(uRes.y, 1.0);
  vec2 p = vec2(uv.x * asp, uv.y);
  vec2 c = vec2(0.4715 * asp, 0.5648);
  float t = uTime;
  vec3 light = vec3(0.0); float cover = 0.0;
  for (int i = 0; i < 7; i++) {
    float fi = float(i);
    float born = i == 0 ? -0.8 : fi * 2.185;
    float age = t - born;
    if (age <= 0.0) continue;
    float grow = smoothstep(0.0, 1.9, age);
    float a = hash(fi * 13.1 + 2.7), b = hash(fi * 79.4 + 5.1), s = hash(fi * 47.9 + 8.7);
    float tm = t * 0.28;
    vec2 base = vec2(a - 0.5, b - 0.5) * 1.5 * 0.285;
    vec2 wander = vec2(
      sin(tm * (0.65 + 0.35 * a) + a * 9.0) * 0.55 + sin(tm * (1.25 + 0.4 * b) + b * 17.0) * 0.3 + sin(tm * (0.22 + 0.12 * s) + s * 5.0) * 0.15,
      cos(tm * (0.58 + 0.32 * b) + b * 7.0) * 0.55 + cos(tm * (1.15 + 0.45 * s) + s * 13.0) * 0.3 + cos(tm * (0.18 + 0.1 * a) + a * 3.0) * 0.15
    ) * 0.285;
    float tf = t * (1.8 + s * 0.9);
    vec2 flutter = vec2(sin(tf + a * 4.0) * 0.007, cos(tf * 1.25 + b * 3.5) * 0.011);
    float d = length(p - (c + base + wander + flutter));
    float ph = fract(t * 0.465 * (0.8 + 0.42 * b) + a * 6.71);
    float flash = 0.0;
    if (ph < 0.45) { float n = ph / 0.45; flash = pow(smoothstep(0.0, 0.28, n) * (1.0 - smoothstep(0.28, 1.0, n)), 1.35); }
    float rest = 0.07 + 0.05 * (0.5 + 0.5 * sin(t * 1.4 + s * 2.5));
    float glow = mix(rest, 1.0, flash) * grow;
    float r = 0.01 * (0.72 + 0.52 * s);
    float core = pow(1.0 - smoothstep(0.0, r * 0.38, d), 2.2);
    float inner = exp(-(d * d) / (r * r * 1.15));
    float outer = (r * 0.11) / (d + r * 0.38) * (1.0 - smoothstep(r * 3.5, r * 11.5, d));
    light += (uCore * 1.4 * (core * 2.6 + inner * 0.85) + uHalo * (inner * 0.45 + outer * 0.55)) * glow;
    cover += (core + inner * 0.75 + outer * 0.35) * glow;
  }
  vec3 col = mix(uBg, light / max(cover, 0.001), clamp(cover, 0.0, 1.0));
  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
      const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
      const prog = gl.createProgram();
      if (v && f) {
        gl.attachShader(prog, v); gl.attachShader(prog, f); gl.bindAttribLocation(prog, 0, "aPos"); gl.linkProgram(prog);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.useProgram(prog);
        const u = (n) => gl.getUniformLocation(prog, n);
        gl.uniform3fv(u("uCore"), rw.color("--site-fly-core"));
        gl.uniform3fv(u("uHalo"), rw.color("--site-fly-halo"));
        gl.uniform3fv(u("uBg"), rw.color("--kf-bg"));
        const uT = u("uTime"), uR = u("uRes"), t0 = performance.now();
        const frame = (now) => {
          if (!alive) return;
          const dpr = Math.min(devicePixelRatio || 1, 1.5);
          const w = Math.max(1, Math.round(cv.clientWidth * dpr)), h = Math.max(1, Math.round(cv.clientHeight * dpr));
          if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
          gl.viewport(0, 0, w, h);
          gl.uniform1f(uT, (reduce ? 0 : (now - t0) / 1000) + 10);
          gl.uniform2f(uR, w, h);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
      }
    }
    // Share = Scene 55% + video 45%. When done, after at least .62s it lifts away upward with a .9s press (if it runs past 6.5s, it just lifts away)
    const t0 = performance.now();
    let gone = false, shown = -1;
    const lift = () => {
      if (gone) return;
      gone = true;
      gsap.to(loader, { yPercent: -100, duration: reduce ? 0 : 0.9, ease: "press", onComplete: () => { alive = false; cancelAnimationFrame(raf); loader.remove(); } });
    };
    const fallback = setTimeout(lift, 6500);
    const off = rw.each(() => {
      const film = Math.round(20 * (rw.filmReady ? 1 : rw.filmPct)) / 20;
      const scene = rw.sceneWarm ? 100 : 0;
      const pct = Math.round(0.55 * scene + 100 * film * 0.45);
      if (pct !== shown) { shown = pct; if (pctEl) pctEl.textContent = pct; }
      if (scene >= 100 && film >= 1) {
        off(); clearTimeout(fallback);
        // The original counts .62s from after the screen is attached (hydration) — measured from page start it is around 1.17s (the original screen begins changing at 1.0s), so match that spot
        setTimeout(lift, Math.max(0, 620 - (performance.now() - t0), 1170 - performance.now()));
      }
    });
  }

  // Glass lens text — only while the cursor moves or presses, an SVG refraction filter is applied to up to four [data-glass] texts overlapping the area around the cursor (26% of screen height, 120~300px)
  const defs = document.querySelector(".rw-glass-defs defs");
  if (defs && !coarse && !reduce) {
    const NS = "http://www.w3.org/2000/svg";
    const LEVEL = "rgb(128,128,128)"; /* Not skin: the no-movement baseline of the displacement map (128 = 0) */
    const lensMap = (() => {
      const n = 128, c = document.createElement("canvas");
      c.width = c.height = n;
      const x2 = c.getContext("2d"), img = x2.createImageData(n, n), h = n / 2;
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const dx = (x + 0.5 - h) / h, dy = (y + 0.5 - h) / h, r = Math.hypot(dx, dy), i = (y * n + x) * 4;
        const fall = r < 1 ? (1 - r * r) ** 2 : 0, bend = r > 1e-4 ? -Math.sin(Math.PI * Math.min(r, 1)) / r : 0;
        img.data[i] = 128 + 127 * dx * bend; img.data[i + 1] = 128 + 127 * dy * bend; img.data[i + 2] = 128; img.data[i + 3] = 255 * fall;
      }
      x2.putImageData(img, 0, 0);
      return c.toDataURL("image/png");
    })();
    const slots = [];
    for (let k = 0; k < 4; k++) {
      const fl = document.createElementNS(NS, "filter");
      fl.id = `rw-glass-${k}`;
      fl.setAttribute("filterUnits", "userSpaceOnUse");
      fl.setAttribute("primitiveUnits", "userSpaceOnUse");
      fl.setAttribute("color-interpolation-filters", "sRGB");
      fl.innerHTML = `<feFlood flood-color="${LEVEL}" result="level"/>
        <feImage preserveAspectRatio="none" result="lens" href="${lensMap}"/>
        <feMerge result="bend"><feMergeNode in="level"/><feMergeNode in="lens"/></feMerge>
        <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="2" seed="${k + 3}" result="noise"/>
        <feComposite in="noise" in2="lens" operator="in" result="wake"/>
        <feMerge result="ripple"><feMergeNode in="level"/><feMergeNode in="wake"/></feMerge>
        <feComposite in="bend" in2="ripple" operator="arithmetic" k1="0" k2="1" k3="0.25" k4="-0.125" result="field"/>
        <feDisplacementMap in="SourceGraphic" in2="field" scale="0" xChannelSelector="R" yChannelSelector="G"/>`;
      defs.append(fl);
      slots.push({ fl, lens: fl.querySelector("feImage"), mix: fl.querySelector("feComposite[operator=arithmetic]"), map: fl.querySelector("feDisplacementMap") });
    }
    let items = null, live = false, kick = 0, wasDown = false, moveAmt = 0;
    const clear = (it) => { if (it.slot >= 0) { it.el.style.filter = ""; it.slot = -1; } };
    rw.each(() => {
      if (!items) items = [...document.querySelectorAll("[data-glass]")].map((el) => ({ el, gate: el.closest(".rw-epi__block"), slot: -1 }));
      const dt = rw.dt;
      if (rw.pressed && !wasDown) kick = 1;
      wasDown = rw.pressed;
      kick *= Math.exp(-1.8 * dt);
      const want = rw.poked ? clamp(0.9 * rw.pSpeed) : 0;
      moveAmt = damp(moveAmt, want, want > moveAmt ? 12 : 2.4, dt);
      const amt = Math.max(moveAmt, rw.pressed ? 0.5 : 0, 1.3 * kick);
      if (amt < 0.012) { if (live) items.forEach(clear); live = false; return; }
      live = true;
      const base = clamp(0.26 * innerHeight, 120, 300);
      const rad = mix(base, base * (2 - kick), clamp(4 * kick));
      const mx = ((rw.px + 1) / 2) * innerWidth, my = ((1 - rw.py) / 2) * innerHeight;
      const scale = (0.16 * base * amt).toFixed(2), k3 = 0.25 + 0.55 * kick + 0.2 * moveAmt;
      let used = 0;
      for (const it of items) {
        if (used >= 4 || (it.gate && it.gate.style.visibility === "hidden")) { clear(it); continue; }
        const r = it.el.getBoundingClientRect();
        if (!(r.width > 0 && r.right > mx - rad && r.left < mx + rad && r.bottom > my - rad && r.top < my + rad)) { clear(it); continue; }
        const s = slots[used];
        s.fl.setAttribute("x", -40); s.fl.setAttribute("y", -40);
        s.fl.setAttribute("width", Math.ceil(r.width + 80)); s.fl.setAttribute("height", Math.ceil(r.height + 80));
        s.lens.setAttribute("x", (mx - r.left - rad).toFixed(1)); s.lens.setAttribute("y", (my - r.top - rad).toFixed(1));
        s.lens.setAttribute("width", (2 * rad).toFixed(1)); s.lens.setAttribute("height", (2 * rad).toFixed(1));
        s.mix.setAttribute("k3", k3.toFixed(3)); s.mix.setAttribute("k4", (-0.5 * k3).toFixed(3));
        s.map.setAttribute("scale", scale);
        if (it.slot !== used) { it.el.style.filter = `url(#rw-glass-${used})`; it.slot = used; }
        used++;
      }
    });
  }
})();
