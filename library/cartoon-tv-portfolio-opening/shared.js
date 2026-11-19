/* Used by all pages: skin color reading, loader (triple-layer RGB number glitch), CRT turn-on·turn-off veil, menu open/close, sound button */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Resolve css variables (including oklch(from …)) into three real sRGB 0~1 values — so canvas·shaders follow the skin
  const probe = document.createElement("i");
  probe.style.cssText = "position:absolute;width:0;height:0;visibility:hidden";
  const ctx = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true });
  const color = (name) => {
    if (!probe.isConnected) document.body.appendChild(probe);
    probe.style.color = `var(${name})`;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = getComputedStyle(probe).color;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };
  const css = (name) => {
    if (!probe.isConnected) document.body.appendChild(probe);
    probe.style.color = `var(${name})`;
    return getComputedStyle(probe).color;
  };
  const font = (name) => {
    if (!probe.isConnected) document.body.appendChild(probe);
    probe.style.fontFamily = `var(${name})`;
    return getComputedStyle(probe).fontFamily;
  };

  const rand = (a, b) => { const n = 43758.5453 * Math.sin(12.9898 * a + 78.233 * b); return n - Math.floor(n); };

  // ── Loader: in original order — 0ms 1%, 1000 5%, 1350 12%, 1800 66%, 2200 99%, and at 2600 100% if the scene is ready ──
  const STEPS = [
    { value: 1, at: 0, pulses: [[0, 1], [260, 0.8], [470, 1], [700, 0.7]] },
    { value: 5, at: 1000, pulses: [[0, 0.6]] },
    { value: 12, at: 1350, pulses: [[0, 0.6]] },
    { value: 66, at: 1800, pulses: [[0, 0.65], [220, 0.35]] },
    { value: 99, at: 2200, pulses: [[0, 0.65]] },
  ];
  function runLoader(isReady, onDone) {
    const wrap = document.querySelector(".qd-loader");
    if (!wrap) return onDone();
    const cv = wrap.querySelector("canvas"), num = wrap.querySelector(".qd-loader__num"), g = cv.getContext("2d");
    if (reduce) { wrap.style.display = "none"; return onDone(); }
    let W = 1, H = 1, dpr = 1, text = "", layers = null, lw = 0, lh = 0;
    const size = () => Math.min(104, Math.max(44, (76 / 1920) * innerWidth)) * dpr;
    const build = () => {
      if (!text) { layers = null; return; }
      const fs = size(), f = `700 ${fs}px ${getComputedStyle(num).fontFamily}`;
      const m = document.createElement("canvas").getContext("2d");
      m.font = f; if ("letterSpacing" in m) m.letterSpacing = `${-0.04 * fs}px`;
      const mt = m.measureText(text), pad = Math.ceil(0.1 * fs), asc = mt.actualBoundingBoxAscent;
      lw = Math.ceil(mt.width + 2 * pad); lh = Math.ceil(asc + mt.actualBoundingBoxDescent + 2 * pad);
      // Adding (lighter) the red·green·blue three boards, overlap shows white text and misalignment shows colored edges
      layers = [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map((c) => { /* Not skin: RGB split channel */
        const l = Object.assign(document.createElement("canvas"), { width: lw, height: lh }), x = l.getContext("2d");
        x.font = f; if ("letterSpacing" in x) x.letterSpacing = m.letterSpacing;
        const white = color("--site-white");
        x.fillStyle = `rgb(${c.map((v, i) => Math.round(v * white[i] * 255)).join(" ")})`;
        x.fillText(text, pad, pad + asc);
        return l;
      });
    };
    const resize = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = cv.width = Math.max(1, Math.round(cv.clientWidth * dpr)); H = cv.height = Math.max(1, Math.round(cv.clientHeight * dpr)); build(); };
    const draw = (t, k, alpha = 1) => {
      g.globalCompositeOperation = "source-over"; g.globalAlpha = 1; g.clearRect(0, 0, W, H);
      if (!layers || alpha <= 0) return;
      const x0 = Math.round((W - lw) / 2), y0 = Math.round((H - lh) / 2);
      g.globalCompositeOperation = "lighter"; g.globalAlpha = alpha;
      if (k < 0.001) { layers.forEach((l) => g.drawImage(l, x0, y0)); }
      else {
        const frame = Math.floor(30 * t), fs = size(), sep = 0.1 * k * fs, dir = rand(frame, 0) > 0.5 ? 1 : -1, row = Math.max(1, Math.round(2 * dpr));
        g.globalAlpha = alpha * (1 - 0.55 * Math.min(1, k) * rand(frame, 1));
        for (let o = 0; o < lh; o += row) {
          const v = 1 - (y0 + o) / H;
          let dx = Math.sin(15 * v + 20 * t) * Math.sin(73 * v - 10 * t) * 0.22 * k * fs;
          if (rand(Math.floor(20 * v), frame) > 0.85) dx += 0.45 * k * fs * dir;
          const hh = Math.min(row, lh - o);
          g.drawImage(layers[0], 0, o, lw, hh, x0 + dx - sep, y0 + o, lw, hh);
          g.drawImage(layers[1], 0, o, lw, hh, x0 + dx, y0 + o, lw, hh);
          g.drawImage(layers[2], 0, o, lw, hh, x0 + dx + sep, y0 + o, lw, hh);
        }
      }
      g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
    };
    const now = () => performance.now() / 1000;
    const pulses = [];
    let state = "count", outAt = null, raf = 0;
    const set = (v, ps) => { text = `${v}%`; num.textContent = text; build(); const t = now(); ps.forEach(([ms, k]) => pulses.push({ start: t + ms / 1000, k })); };
    const done = () => { if (state === "done") return; state = "done"; set(100, [[0, 0.7]]); setTimeout(() => (outAt = now()), 420); };
    const tick = () => {
      const t = now();
      if (outAt !== null) {
        // End: over .5s the glitch grows 2.4 times as it fades
        const n = Math.min(1, (t - outAt) / 0.5);
        draw(t, 2.4 * n, 1 - n * n);
        if (n >= 1) { gsap.delayedCall(0.08, () => { wrap.style.display = "none"; onDone(); }); return; }
        raf = requestAnimationFrame(tick); return;
      }
      let k = 0;
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        if (t - p.start >= 0.5) { pulses.splice(i, 1); continue; }
        if (t < p.start) continue;
        const r = (t - p.start) / 0.5;
        k = Math.max(k, p.k * (1 - r) * (1 - r));
      }
      draw(t, k);
      raf = requestAnimationFrame(tick);
    };
    resize(); addEventListener("resize", resize);
    document.fonts.load(`700 76px ${getComputedStyle(num).fontFamily}`).then(build).catch(() => {});
    STEPS.forEach((s) => setTimeout(() => set(s.value, s.pulses), s.at));
    let wait = null;
    setTimeout(() => {
      // Even after 2.6 seconds, if the scene shader isn’t ready the original keeps waiting with a glitch once every 1.2 seconds
      const go = () => { if (isReady()) { clearInterval(wait); done(); return true; } return false; };
      if (!go()) wait = setInterval(() => { if (!go()) pulses.push({ start: now(), k: 0.6 }); }, 1200);
    }, 2600);
    raf = requestAnimationFrame(tick);
  }

  // ── CRT turn-on (dot → horizontal line → screen) and turn-off (screen → horizontal line → black) ──
  const power = document.querySelector(".qd-power"), line = power?.querySelector("i");
  const powerOn = (dur = 0.9) => {
    if (!power || reduce) return gsap.timeline();
    gsap.set(power, { autoAlpha: 1 });
    gsap.set(line, { scaleX: 0.004, scaleY: 3, opacity: 1 });
    return gsap.timeline()
      .to(line, { scaleX: 0.012, scaleY: 5, duration: dur * 0.3, ease: "power2.out" })
      .to(line, { scaleX: 1, scaleY: 1, duration: dur * 0.3, ease: "power2.in" })
      .to(line, { scaleY: 260, opacity: 0, duration: dur * 0.4, ease: "power2.out" })
      .to(power, { autoAlpha: 0, duration: dur * 0.4, ease: "power2.out" }, "<");
  };
  const powerOff = (dur = 0.4) => {
    if (!power || reduce) return gsap.timeline();
    gsap.set(power, { autoAlpha: 0 });
    gsap.set(line, { scaleX: 1, scaleY: 260, opacity: 0 });
    return gsap.timeline()
      .to(power, { autoAlpha: 1, duration: dur * 0.45, ease: "power2.in" })
      .to(line, { scaleY: 1, opacity: 1, duration: dur * 0.45, ease: "power2.in" }, "<")
      .to(line, { scaleX: 0.6, duration: dur * 0.55, ease: "power2.out" });
  };

  // ── Menu: on press the screen folds as if switched off, then a red room (canvas) opens. The scene is received and drawn by index.js via qd:menu ──
  const menu = document.getElementById("qd-menu"), btn = document.querySelector(".qd-menu-btn");
  let open = false, busy = false;
  const setMenu = (want) => {
    if (!menu || busy || want === open) return;
    busy = true; open = want;
    btn.setAttribute("aria-expanded", String(open));
    const tl = powerOff(0.4);
    tl.call(() => {
      menu.hidden = !open;
      document.dispatchEvent(new CustomEvent("qd:menu", { detail: { open } }));
    });
    tl.add(powerOn(0.6));
    tl.call(() => { busy = false; if (open) menu.querySelector("a")?.focus({ preventScroll: true }); });
  };
  btn?.addEventListener("click", () => setMenu(!open));
  menu?.querySelector(".qd-menu__close")?.addEventListener("click", () => setMenu(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && open) setMenu(false); });
  menu?.querySelectorAll("[data-go]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    const id = a.dataset.go;
    setMenu(false);
    setTimeout(() => document.dispatchEvent(new CustomEvent("qd:go", { detail: { id } })), 420);
  }));

  const sound = document.querySelector(".qd-sound");
  sound?.addEventListener("click", () => sound.setAttribute("aria-pressed", String(sound.getAttribute("aria-pressed") !== "true")));

  window.QD = { reduce, color, css, font, rand, runLoader, powerOn, powerOff, setMenu, get menuOpen() { return open; } };
})();
