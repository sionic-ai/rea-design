// Shared by all pages: Lenis (original 1.3.11 · 1.5s easeOutQuart · wheel .8 · anchor 3s), text splitting, hover lock (doesn’t leave before the enter has fully run),
// Tools for is-action when visible, hiding the phone header, hiding the scroll hint when the footer is visible, sound on (howler), and building our Lottie.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const lenis = reduce ? null : new Lenis({
    duration: 1.5,
    easing: easeOutQuart,
    smoothWheel: true,
    wheelMultiplier: 0.8,
    anchors: { duration: 3, easing: easeInOutCubic, lock: true, onComplete: () => root.classList.remove("is-anchor-scrolling") },
    autoRaf: true,
  });
  lenis?.on("scroll", ScrollTrigger.update);

  // Original splitLabel(start delay, per-unit delay, text|line) — each character gets --start-delay and --end-delay (the original’s effect argument is dropped because no css uses it).
  // So multi-line Korean text doesn’t break mid-word, wrap words in nowrap chunks and leave the spaces between them as they are
  function split(el) {
    const [start, step, type] = (el.dataset.split || "0,20,text").split(",").map((v, i) => (i < 2 ? +v : v.trim()));
    const cell = (txt, s, e) => `<span class="ar-ch"><span data-char="${txt}" style="--start-delay:${s}ms;--end-delay:${e}ms">${txt}</span></span>`;
    if (type === "line") {
      const lines = el.innerHTML.split(/<br\s*\/?>/i).map((l) => l.trim()).filter(Boolean);
      el.innerHTML = lines.map((l, i) => cell(l, start + i * step, start + (lines.length - i - 1) * step)).join("<br>");
      return;
    }
    // Like the original, count text pieces and the small and span inside them in sequence to assign delays, leaving the wrapping element (small text) alone.
    // Original counts a space as one character too (without splitting it), so the next character’s delay shifts by that much
    const total = el.textContent.replace(/\s+/g, " ").trim().length;
    let n = 0;
    const words = (text) => text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean).map((w, wi) => {
      if (wi) n += 1;
      return `<span class="ar-word">${[...w].map((c) => {
        const html = cell(c, start + step * n, start + step * (total - n - 1));
        n += 1;
        return html;
      }).join("")}</span>`;
    }).join(" ");
    const parts = [...el.childNodes].filter((node) => node.textContent.trim()).map((node, i) => {
      if (i) n += 1;
      if (node.nodeType === 3) return words(node.textContent);
      node.innerHTML = words(node.textContent);
      return node.outerHTML;
    });
    el.innerHTML = parts.join(" ");
  }
  document.querySelectorAll("[data-split]").forEach(split);

  // Two sets of arrows (current and incoming)
  const ARROW = '<svg viewBox="0 0 12 8"><path d="M0 4.5h11M8.2 1.9l3 2.6-3 2.6"/></svg>';
  document.querySelectorAll("[data-arrow]").forEach((el) => {
    el.innerHTML = `<span class="ar-arrow__track"><span class="ar-arrow__icon is-before">${ARROW}</span><span class="ar-arrow__icon is-after">${ARROW}</span></span>`;
  });

  // Original hover component — delays leave until enter (ms) has fully run, and if it is still raised when leave finishes, lifts it again
  document.querySelectorAll("[data-hover]").forEach((el) => {
    const enter = +(el.dataset.enter ?? 800), leave = +(el.dataset.leave ?? 800);
    let over = false, playing = false;
    const startEnter = () => { playing = true; el.classList.add("is-hover"); setTimeout(endEnter, enter); };
    const startLeave = () => { playing = true; el.classList.remove("is-hover"); setTimeout(endLeave, leave); };
    function endEnter() { playing = false; if (!over) startLeave(); }
    function endLeave() { playing = false; if (over) startEnter(); }
    el.addEventListener("mouseenter", () => { over = true; if (!playing) startEnter(); });
    el.addEventListener("mouseleave", () => { over = false; if (!playing) startLeave(); });
  });

  // x-intersect(.full = When fully visible, .half = Half) → is-action
  const seen = { full: 0.99, half: 0.5, any: 0 };
  document.querySelectorAll("[data-intersect]").forEach((el) => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { el.classList.add("is-action"); io.disconnect(); }
    }), { threshold: seen[el.dataset.intersect || "any"] });
    io.observe(el);
  });

  // Anchor inside the header (rolls to the section head in 3s): the section name rises 1.8s late while rolling
  document.querySelectorAll('.ar-nav a[href^="#"]').forEach((a) => a.addEventListener("click", () => root.classList.add("is-anchor-scrolling")));

  // Phone header: checks the Lenis direction once every 100ms
  const header = document.querySelector(".ar-header");
  let lastDir = 0, tick = 0;
  lenis?.on("scroll", ({ direction }) => {
    const now = performance.now();
    if (now - tick < 100) return;
    tick = now;
    if (direction && direction !== lastDir) { lastDir = direction; header?.classList.toggle("is-down", direction === 1); }
  });

  // Hide the scroll hint when the footer enters the screen (once per 150ms)
  const foot = document.querySelector("footer");
  const scrollCue = document.querySelector(".ar-scrolldown");
  let footTick = 0;
  const footCheck = () => {
    const now = performance.now();
    if (now - footTick < 150 || !foot || !scrollCue) return;
    footTick = now;
    scrollCue.classList.toggle("is-hidden", foot.getBoundingClientRect().top <= innerHeight);
  };
  addEventListener("scroll", footCheck, { passive: true });

  // Sound — the original loops background music with howler. Instead of an audio file, a quiet chord is synthesized on the spot, with the same on·off behavior (first press plays with sound, afterwards it toggles mute).
  function pad() {
    const rate = 22050, secs = 4, n = rate * secs;
    const buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
    const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVEfmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) {
      const t = i / rate, env = Math.sin(Math.PI * (i / n));
      const s = (Math.sin(2 * Math.PI * 220 * t) + Math.sin(2 * Math.PI * 277.2 * t) * 0.6 + Math.sin(2 * Math.PI * 329.6 * t) * 0.4) * 0.06 * env;
      v.setInt16(44 + i * 2, s * 32767, true);
    }
    return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
  }
  let sound = null, playing = false, muted = true;
  const sounds = document.querySelectorAll("[data-sound]");
  const paint = () => sounds.forEach((b) => {
    b.classList.toggle("is-on", !muted);
    b.querySelector(".ar-sound__state").textContent = muted ? "OFF" : "ON";
  });
  sounds.forEach((b) => b.addEventListener("click", () => {
    if (!sound && window.Howl) sound = new Howl({ src: [pad()], format: ["wav"], loop: true, volume: 1, html5: true });
    if (!sound) return;
    if (!playing) { sound.play(); playing = true; sound.mute(false); muted = false; }
    else if (!muted) { sound.mute(true); muted = true; }
    else { sound.mute(false); muted = false; }
    paint();
  }));

  // ───────── Our Lottie — the same player (lottie-web 5.13) and same frame count as the original Lottie, with the artwork newly built ─────────
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  function rgb(cssVar) {
    const el = document.body.appendChild(document.createElement("i"));
    el.style.color = `var(${cssVar})`;
    const c = getComputedStyle(el).color;
    el.remove();
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = c;
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255, 1];
  }
  const st = (k) => ({ a: 0, k });
  const kf = (t0, v0, t1, v1, o, i) => ({ a: 1, k: [{ t: t0, s: [v0], o: { x: [o[0]], y: [o[1]] }, i: { x: [i[0]], y: [i[1]] } }, { t: t1, s: [v1] }] });
  const tr = () => ({ ty: "tr", p: st([0, 0]), a: st([0, 0]), s: st([100, 100]), r: st(0), o: st(100), sk: st(0), sa: st(0) });
  const LT = {
    rgb,
    kf,
    path: (v, i, o, c = true) => ({ ty: "sh", ks: st({ v, i: i || v.map(() => [0, 0]), o: o || v.map(() => [0, 0]), c }) }),
    fill: (c, o = st(100)) => ({ ty: "fl", c: st(c), o, r: 1 }),
    stroke: (c, w) => ({ ty: "st", c: st(c), o: st(100), w: st(w), lc: 2, lj: 2 }),
    trim: (s, e) => ({ ty: "tm", s, e, o: st(0), m: 1 }),
    group: (items) => ({ ty: "gr", it: [...items, tr()] }),
    layer: (ind, shapes, { p = [0, 0], o = st(100), ip = 0, op = 99999 } = {}) => ({
      ddd: 0, ind, ty: 4, nm: `l${ind}`, sr: 1, ao: 0, ip, op, st: 0, bm: 0,
      ks: { o, r: st(0), p: st([p[0], p[1], 0]), a: st([0, 0, 0]), s: st([100, 100, 100]) }, shapes,
    }),
    anim: (w, h, op, layers) => ({ v: "5.7.0", fr: 29.97, ip: 0, op, w, h, nm: "ar", ddd: 0, assets: [], layers }),
    // Shape of a cell with side c — square, quarter circle (corner center), half circle (side center). r is the number of 90° turns
    cell(kind, c, r = 0) {
      const h = c / 2, k = 0.5523;
      let v, i, o;
      if (kind === "quarter") {
        v = [[-h, -h], [h, -h], [-h, h]]; o = [[0, 0], [0, c * k], [0, 0]]; i = [[0, 0], [0, 0], [c * k, 0]];
      } else if (kind === "half") {
        v = [[-h, -h], [h, -h], [0, 0]]; o = [[0, 0], [0, h * k], [-h * k, 0]]; i = [[0, h * k], [0, 0], [h * k, 0]];
      } else {
        v = [[-h, -h], [h, -h], [h, h], [-h, h]];
      }
      const rot = ([x, y]) => { for (let n = 0; n < r; n++) [x, y] = [-y, x]; return [x, y]; };
      return LT.path(v.map(rot), i?.map(rot), o?.map(rot));
    },
  };
  window.arLottie = LT;

  // Scroll hint — 500 units, 4s (120 frames): the top solid line draws downward (0→38.8), erases from the top over 60→98, and 17 dots of the bottom dotted line are always present
  const cue = document.querySelector("[data-scroll-cue]");
  if (cue && window.lottie) {
    const ink = rgb("--kf-ink");
    const IO = [0.9, 0], II = [0.1, 1];
    const line = LT.layer(1, [LT.group([
      LT.path([[0, -57], [0, -9]], null, null, false),
      LT.stroke(ink, 1),
      LT.trim(
        { a: 1, k: [{ t: 0, s: [0], o: { x: [IO[0]], y: [IO[1]] }, i: { x: [II[0]], y: [II[1]] } }, { t: 60, s: [0], o: { x: [IO[0]], y: [IO[1]] }, i: { x: [II[0]], y: [II[1]] } }, { t: 98.25, s: [100] }] },
        kf(0, 0, 38.77, 100, IO, II),
      ),
    ])], { p: [250, 226] });
    const dots = Array.from({ length: 17 }, (_, n) => LT.group([
      { ty: "el", p: st([0, 225 + n * 2.962 - 250]), s: st([1, 1]) },
      LT.fill(ink),
    ]));
    const dotted = LT.layer(2, dots, { p: [250, 250], o: st(80) });
    lottie.loadAnimation({
      container: cue, renderer: "svg", loop: true, autoplay: !reduce,
      animationData: LT.anim(500, 500, 120, [line, dotted]),
      rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
    });
  }

  window.arSite = { lenis, split, reduce };
})();
