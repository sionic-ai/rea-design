// Shared machinery for the desktop set — BIOS loader and its opening order, cursor (corners, coordinate marks, dotted line), header chip shuffle and expand, toolbar (Lottie icons),
// Shortcuts, live gauge values, physics boxes (Space·E·100 on phone). The 3D scene and windows are attached to MC by index.js.
(() => {
  gsap.registerPlugin(CustomEase, ScrambleTextPlugin, Flip);
  gsap.ticker.lagSmoothing(0);
  const EASE = CustomEase.create("mc", "M0,0 C0.33,0 0,1 1,1");
  const SCRAMBLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ[]()</>{}#$%&/()=?@*!-_";
  const root = document.documentElement;
  const touch = matchMedia("(hover: none), (pointer: coarse)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (name) => getComputedStyle(root).getPropertyValue(name).trim();
  const bus = new EventTarget();
  const MC = (window.MC = { EASE, SCRAMBLE, touch, reduce, css, bus, on: (t, f) => bus.addEventListener(t, f), emit: (t, d) => bus.dispatchEvent(new CustomEvent(t, { detail: d })), intro: {} });
  const stats = { clicks: 0, hovers: 0, keys: 0, scroll: 0, speed: 0, born: Date.now() };
  MC.stats = stats;

  /* ───────── Sound — the original uses sound effect files, here short beeps are generated in the same spots (off at first) ───────── */
  let audio = null, soundOn = false;
  const blip = (freq = 880, len = 0.05, vol = 0.04) => {
    if (!soundOn) return;
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    o.frequency.value = freq; o.type = "square";
    g.gain.setValueAtTime(vol, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + len);
    o.connect(g).connect(audio.destination); o.start(); o.stop(audio.currentTime + len);
  };
  MC.blip = blip;

  /* ───────── BIOS loader ───────── */
  const bios = document.querySelector(".mc-bios");
  const panel = bios.querySelector(".mc-bios__panel");
  const lines = [...panel.querySelectorAll(".mc-bios__line")];
  root.classList.add("is-locked");
  let booted = false;
  const biosTl = gsap.timeline({ paused: true });
  const caret = document.createElement("span");
  caret.className = "mc-bios__caret";
  const paint = (line, n) => {
    const text = (touch && line.dataset.touchText) || line.dataset.text || "";
    const key = (touch && line.dataset.touchKey) || line.dataset.key;
    const shown = text.slice(0, n);
    line.textContent = "";
    if (key && shown.length) {
      const k = document.createElement("span");
      k.className = "mc-bios__key";
      k.textContent = shown.slice(0, Math.min(n, key.length));
      line.append(k, shown.slice(key.length));
    } else line.append(shown);
    line.append(caret);
  };
  let waiting = null;
  // The original code uses .012s per character, but measured, typing drags while the BIOS loads 3D objects, taking 3.2s to reach the wait line — matched to the measured length
  const CHAR = 0.0192; // Measured, the original loader takes 2.55~3.2s (varies each time) — this copy uses 2.7s
  lines.forEach((line) => {
    if (line.hasAttribute("data-spacer")) { biosTl.add(() => line.append(caret)); return; }
    const text = (touch && line.dataset.touchText) || line.dataset.text || "";
    const s = { n: 0 }, last = { v: -1 };
    biosTl.to(s, {
      n: text.length, duration: Math.max(0.08, CHAR * text.length), ease: "none",
      onStart: () => { paint(line, 0); if (line.hasAttribute("data-wait")) waiting = true; },
      onUpdate: () => { const n = Math.floor(s.n); if (n !== last.v) { last.v = n; paint(line, n); blip(1200 + n * 9, 0.012, 0.012); } },
      onComplete: () => paint(line, text.length),
    });
    if (line.dataset.status) {
      const st = document.createElement("span");
      st.textContent = line.dataset.status;
      st.style.display = "inline-block";
      biosTl.add(() => { caret.remove(); line.append(st, caret); });
      biosTl.fromTo(st, { opacity: 1 }, { opacity: 0, duration: 0.1, ease: "steps(1)", repeat: 5, yoyo: true });
      biosTl.set(st, { opacity: 1 });
    }
    if (line.hasAttribute("data-wait")) biosTl.add(() => { biosTl.pause(); caretBlink.play(); });
  });
  const caretBlink = gsap.fromTo(caret, { opacity: 1 }, { opacity: 0, duration: 0.5, ease: "steps(1)", repeat: -1, yoyo: true, paused: true });

  const boot = () => {
    if (booted) return;
    booted = true;
    removeEventListener("keydown", onKey, true);
    removeEventListener("pointerup", onUp, true);
    caretBlink.kill();
    biosTl.progress(1).kill();
    blip(660, 0.12, 0.05);
    const tl = gsap.timeline({ onComplete: () => root.classList.remove("is-locked") });
    tl.to(panel, { opacity: 0, duration: 0.35, ease: "power2.out" });
    tl.set(panel, { display: "none" });
    tl.add(() => MC.emit("boot", { tl }), 0);
    MC.bootTl = tl;
  };
  const onKey = (e) => {
    if (e.key === "Tab") e.preventDefault();
    if ((e.key === "s" || e.key === "S") && keysDown.has("Tab")) return boot();
    if (waiting && e.key === "Enter") boot();
  };
  const keysDown = new Set();
  addEventListener("keydown", (e) => keysDown.add(e.key));
  addEventListener("keyup", (e) => keysDown.delete(e.key));
  const onUp = () => { if (waiting) boot(); };
  addEventListener("keydown", onKey, true);
  addEventListener("pointerup", onUp, true);
  MC.boot = boot;

  /* Opening order — original timeline: panel vanishes → gauge letters → +.6 title → +.4 object → +.4 header chip · bottom chip · windows (.04 per window) */
  MC.on("boot", () => {
    // Measured on the original, from .53s after the press the gauge digits light up one by one at random over 1.07s (no curve) — the first frame lands a beat late, so hook it at .38.
    // Header chip, bottom and window open after staying quiet for a good while (over .9s) once all letters are lit
    const tl = gsap.timeline({ delay: reduce ? 0 : 0.38 });
    const chars = [...document.querySelectorAll(".mc-meter [data-ch]")];
    if (chars.length) tl.to(chars, { opacity: 1, duration: 0.02, ease: "none", stagger: { amount: 0.95, from: "random" } }, 0);
    tl.add(() => MC.intro.title?.(), 0.6);
    tl.add(() => MC.intro.object?.(), 1.0);
    const head = gsap.utils.toArray('[data-intro="head"]'), foot = gsap.utils.toArray('[data-intro="foot"]');
    tl.to(head, { y: 0, duration: 1, ease: EASE, stagger: 0.06, clearProps: "transform" }, 2.15);
    tl.to(foot, { y: 0, duration: 1, ease: EASE, stagger: 0.06, clearProps: "transform" }, 2.15);
    tl.add(() => MC.intro.windows?.(), 2.15);
    if (reduce) tl.progress(1);
  });
  gsap.set('[data-intro="head"]', { y: -200 });
  gsap.set('[data-intro="foot"]', { y: 200 });

  // Split dashboard text into letters and turn them off — light them in random order when opened
  document.querySelectorAll(".mc-meter dt, .mc-meter dd, .mc-meter__k").forEach((el) => {
    if (el.hasAttribute("data-live")) return;
    const t = el.textContent;
    el.setAttribute("aria-label", t);
    el.textContent = "";
    for (const c of t) {
      const s = document.createElement("span");
      s.dataset.ch = "";
      s.setAttribute("aria-hidden", "true");
      s.style.opacity = 0;
      s.textContent = c;
      el.append(s);
    }
  });
  document.querySelectorAll(".mc-meter [data-live]").forEach((el) => { el.dataset.ch = ""; el.style.opacity = 0; });

  // The original starts typing after the scene (3D objects) has fully loaded — about .85s after loading
  const startAt = performance.now();
  Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2000))]).then(() => {
    setTimeout(() => biosTl.play(), Math.max(0, 850 - (performance.now() - startAt)));
  });
  if (reduce) { biosTl.progress(1); }

  /* ───────── Header chip — letter cells are fixed in place, and on hover they scramble with ScrambleText (speed .4) and return ───────── */
  const splitScramble = (el) => {
    const text = el.textContent;
    el.setAttribute("aria-label", text);
    el.textContent = "";
    const cells = [];
    for (const c of text) {
      const cell = document.createElement("span");
      cell.className = "mc-sc";
      cell.setAttribute("aria-hidden", "true");
      cell.innerHTML = `<span class="mc-sc__w"></span><span class="mc-sc__c"></span>`;
      cell.firstChild.textContent = c;
      cell.lastChild.textContent = c;
      el.append(cell);
      cells.push(cell.lastChild);
    }
    el._cells = cells;
  };
  const scramble = (el) => {
    (el._cells || []).forEach((c, i) => {
      const ch = c.previousSibling.textContent;
      if (ch === " ") return;
      gsap.to(c, { duration: 0.4 + i * 0.03, scrambleText: { text: ch, chars: SCRAMBLE, speed: 0.4 }, overwrite: true });
    });
  };
  document.querySelectorAll("[data-scramble]").forEach((el) => {
    const target = el.querySelector("[data-scramble]") ? null : el;
    if (!target) return;
    splitScramble(el);
    el.addEventListener("pointerenter", () => { scramble(el); stats.hovers++; blip(1500, 0.02, 0.02); });
  });
  MC.scramble = scramble;
  MC.splitScramble = splitScramble;

  // Chip expand (map, contribution grid) — width and height on the original .8s curve
  const graph = document.querySelector(".mc-graph");
  if (graph) for (let i = 0; i < 26 * 7; i++) { const c = document.createElement("i"); c.style.setProperty("--v", ((i * 37) % 11) / 10 > 0.5 ? ((i * 13) % 5) : 0); graph.append(c); }
  document.querySelectorAll(".mc-chip--drop").forEach((chip) => {
    const btn = chip.querySelector(".mc-ico"), pnl = chip.querySelector(".mc-chip__panel");
    let open = false;
    const set = (v) => {
      open = v;
      btn.setAttribute("aria-expanded", v);
      chip.classList.toggle("is-open", v);
      // As in the original, a closed chip is the text width, and when open its width and height grow together to the panel size (362×230)
      const inner = pnl.firstElementChild, h = inner.scrollHeight + (pnl.classList.contains("mc-chip__panel--graph") ? 16 : 0), w = inner.scrollWidth + (pnl.classList.contains("mc-chip__panel--graph") ? 16 : 0);
      gsap.to(pnl, { height: v ? h : 0, width: v ? w : 0, duration: 0.8, ease: EASE, overwrite: true });
      blip(v ? 520 : 400, 0.06, 0.03);
    };
    btn.addEventListener("click", (e) => { e.stopPropagation(); set(!open); });
    chip._toggle = () => set(!open);
    document.addEventListener("click", (e) => { if (open && !chip.contains(e.target)) set(false); });
  });

  /* ───────── 32px glass button — when hovered, the base panel shrinks to .8× over 1s with elastic.out(1, .3), and the color deepens over .5s power2.out ───────── */
  document.querySelectorAll(".mc-ico").forEach((btn) => {
    const bg = document.createElement("span");
    bg.className = "mc-ico__bg";
    bg.setAttribute("aria-hidden", "true");
    btn.prepend(bg);
    const host = btn.closest(".mc-link") || btn;
    const on = () => { host.classList.add("is-hot"); gsap.to(bg, { scale: 0.8, duration: 1, ease: "elastic.out(1, 0.3)", overwrite: "auto" }); };
    const off = () => { host.classList.remove("is-hot"); gsap.to(bg, { scale: 1, duration: 1, ease: "elastic.out(1, 0.3)", overwrite: "auto" }); };
    host.addEventListener("mouseenter", on);
    host.addEventListener("mouseleave", off);
    if (touch) btn.addEventListener("click", () => { on(); setTimeout(off, 500); });
  });

  /* ───────── Toolbar — icons are Lottie animations we built (60fps, 90 frames, same length as the original). Hover draws it once from the start ───────── */
  const K = 0.5523;
  const poly = (pts, closed = false) => ({ ty: "sh", ks: { a: 0, k: { i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]), v: pts, c: closed } } });
  const circ = (cx, cy, r) => ({ ty: "sh", ks: { a: 0, k: { c: true, v: [[cx, cy - r], [cx + r, cy], [cx, cy + r], [cx - r, cy]], i: [[-r * K, 0], [0, -r * K], [r * K, 0], [0, r * K]], o: [[r * K, 0], [0, r * K], [-r * K, 0], [0, -r * K]] } } });
  const ICONS = {
    lang: [circ(256, 256, 150), poly([[106, 256], [406, 256]]), { ty: "sh", ks: { a: 0, k: { c: true, v: [[256, 106], [256, 406]], i: [[-60, 0], [60, 0]], o: [[-60, 0], [60, 0]] } } }],
    sound: [poly([[146, 216], [146, 296]]), poly([[201, 166], [201, 346]]), poly([[256, 126], [256, 386]]), poly([[311, 186], [311, 326]]), poly([[366, 226], [366, 286]])],
    object: [poly([[256, 106], [386, 181], [386, 331], [256, 406], [126, 331], [126, 181]], true), poly([[126, 181], [256, 256], [386, 181]]), poly([[256, 256], [256, 406]])],
    moon: [{ ty: "sh", ks: { a: 0, k: { c: true, v: [[300, 110], [300, 402], [180, 256]], i: [[0, 0], [100, -20], [0, 120]], o: [[-100, 20], [0, 0], [0, -120]] } } }],
    sun: [circ(256, 256, 70), ...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => { const a = (k * Math.PI) / 4; return poly([[256 + Math.cos(a) * 110, 256 + Math.sin(a) * 110], [256 + Math.cos(a) * 150, 256 + Math.sin(a) * 150]]); })],
    layout: [poly([[116, 136], [396, 136], [396, 376], [116, 376]], true), poly([[226, 136], [226, 376]]), poly([[226, 256], [396, 256]])],
    grid: [poly([[116, 116], [396, 116], [396, 396], [116, 396]], true), poly([[209, 116], [209, 396]]), poly([[302, 116], [302, 396]]), poly([[116, 209], [396, 209]]), poly([[116, 302], [396, 302]])],
  };
  const kf = (t, s) => ({ t, s, o: { x: [0.33], y: [0] }, i: { x: [0], y: [1] } });
  const lottieJson = (shapes) => ({
    v: "5.13.0", fr: 60, ip: 0, op: 90, w: 512, h: 512, nm: "mc", ddd: 0, assets: [],
    layers: [{
      ddd: 0, ind: 1, ty: 4, nm: "icon", sr: 1, ao: 0, ip: 0, op: 90, st: 0, bm: 0,
      ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [256, 256, 0] }, a: { a: 0, k: [256, 256, 0] }, s: { a: 1, k: [kf(0, [100, 100, 100]), kf(18, [82, 82, 100]), { t: 60, s: [100, 100, 100] }] } },
      shapes: [{ ty: "gr", it: [...shapes,
        { ty: "st", c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 30 }, lc: 2, lj: 2 },
        { ty: "tm", s: { a: 0, k: 0 }, e: { a: 1, k: [kf(0, [0]), { t: 54, s: [100] }] }, o: { a: 0, k: 0 }, m: 1 },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }] }],
    }],
  });
  const anims = new Map();
  document.querySelectorAll(".mc-lottie[data-icon]").forEach((box) => {
    const a = lottie.loadAnimation({ container: box, renderer: "svg", loop: false, autoplay: false, animationData: lottieJson(ICONS[box.dataset.icon]) });
    a.addEventListener("DOMLoaded", () => a.goToAndStop(89, true));
    anims.set(box, a);
  });
  const play = (btn) => btn.querySelectorAll(".mc-lottie").forEach((b) => anims.get(b)?.goToAndPlay(0, true));
  document.querySelectorAll(".mc-tool").forEach((btn) => btn.addEventListener("pointerenter", () => { play(btn); blip(1700, 0.02, 0.02); }));

  const actions = {
    lang: () => MC.emit("lang"),
    sound: () => {
      soundOn = !soundOn;
      const b = document.querySelector('[data-tool="sound"]');
      b.classList.toggle("is-off", !soundOn);
      b.setAttribute("aria-pressed", soundOn);
      b.setAttribute("aria-label", soundOn ? "Sound Off" : "Sound On");
      blip(880, 0.08, 0.05);
    },
    object: () => MC.emit("object"),
    theme: () => {
      const dark = root.dataset.theme !== "dark";
      root.dataset.theme = dark ? "dark" : "light";
      document.querySelector('[data-tool="theme"]').setAttribute("aria-label", dark ? "Switch to light" : "Switch to dark");
      MC.emit("theme");
    },
    layout: () => MC.emit("layout"),
    grid: () => { root.classList.toggle("is-gridless"); MC.emit("grid"); },
  };
  document.querySelectorAll(".mc-tool").forEach((btn) => btn.addEventListener("click", () => actions[btn.dataset.tool]?.()));
  MC.actions = actions;

  // Shortcuts — the original list as is (T·S·O·D·L·G·M·H·E·0~2, Space is the box)
  const SHORT = { t: "lang", s: "sound", o: "object", d: "theme", l: "layout", g: "grid" };
  addEventListener("keydown", (e) => {
    if (!booted || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
    if (e.target.closest?.("input, textarea, [contenteditable]")) return;
    const k = e.key.toLowerCase();
    if (SHORT[k]) { const btn = document.querySelector(`[data-tool="${SHORT[k]}"]`); if (btn) play(btn); actions[SHORT[k]](); }
    else if (k === "m") document.querySelector('[data-drop="map"]')?._toggle();
    else if (k === "h") document.querySelector('[data-drop="graph"]')?._toggle();
    else if (k === "e") MC.cubes?.explode(pointer.x, pointer.y);
    else if (/^[0-9]$/.test(k)) MC.emit("project", +k);
    else if (e.code === "Space" && pointer.ready) { e.preventDefault(); MC.cubes?.spawn(pointer.x, pointer.y); }
  });

  /* ───────── Cursor — four corners (normally 5px · spread 20px above clickable things in .3s power2.out), after moving over 100px it drops a coordinate marker and retracts it after 3 seconds ───────── */
  const pointer = { x: innerWidth / 2, y: innerHeight / 2, ready: false };
  MC.pointer = pointer;
  if (!touch) {
    root.classList.add("has-cursor");
    const cur = document.querySelector(".mc-cursor"), box = cur.querySelector(".mc-cursor__box"), label = cur.querySelector(".mc-cursor__label");
    const corners = [...cur.querySelectorAll(".mc-cursor__c")];
    const CORNER = [{ dx: -1, dy: -1, ax: 0, ay: 0 }, { dx: 1, dy: -1, ax: -1, ay: 0 }, { dx: -1, dy: 1, ax: 0, ay: -1 }, { dx: 1, dy: 1, ax: -1, ay: -1 }];
    const place = (hot, now) => corners.forEach((c, i) => {
      const d = CORNER[i], a = hot ? 20 : 5, s = hot ? 10 : 5;
      const v = { x: d.dx * a + d.ax * s, y: d.dy * a + d.ay * s, width: s, height: s };
      now ? gsap.set(c, v) : gsap.to(c, { ...v, duration: 0.3, ease: "power2.out", overwrite: "auto" });
    });
    place(false, true);
    const setX = gsap.quickSetter(cur, "x", "px"), setY = gsap.quickSetter(cur, "y", "px");
    const line = document.querySelector(".mc-trail line"), marks = document.querySelector(".mc-marks");
    let hot = false, lbl = "", lastDrop = 0, dist = 0, anchor = null, stopT = 0;
    const list = [];
    const drawLine = () => {
      if (!anchor || !pointer.ready) { line.style.visibility = "hidden"; return; }
      line.style.visibility = "visible";
      line.setAttribute("x1", anchor.x); line.setAttribute("y1", anchor.y);
      line.setAttribute("x2", pointer.x); line.setAttribute("y2", pointer.y);
    };
    const drop = (x, y) => {
      x = Math.round(x); y = Math.round(y);
      const m = document.createElement("div");
      m.className = "mc-mark";
      m.style.left = x + "px"; m.style.top = y + "px";
      m.innerHTML = `<div class="mc-mark__in"><div class="mc-mark__box"></div><span class="mc-mark__xy">${x}<br>${y}</span></div>`;
      marks.append(m);
      gsap.fromTo(m.firstChild, { scale: 0 }, { scale: 1, duration: 0.25, ease: "power2.out" });
      list.push({ el: m, x, y, at: Date.now() });
      anchor = { x, y }; lastDrop = Date.now(); dist = 0;
      drawLine();
    };
    setInterval(() => {
      const now = Date.now();
      while (list.length && now - list[0].at >= 3000) {
        list.shift().el.remove();
      }
      if (!list.length && anchor) { const a = anchor; anchor = null; gsap.to(line, { attr: { x1: pointer.x, y1: pointer.y }, duration: 0.3, ease: "power2.in", onComplete: () => { if (!anchor) line.style.visibility = "hidden"; } }); void a; }
    }, 300);
    const hotOf = (t) => {
      if (!(t instanceof Element)) return ["", false];
      const l = t.closest("[data-cursor-label]");
      return [l?.getAttribute("data-cursor-label") || "", !!(l || t.closest("a, button, [data-handle]")) && !t.closest(".wf-ui")];
    };
    const setHot = (t) => {
      const [l, h] = hotOf(t);
      if (h !== hot) { hot = h; place(h); }
      if (l !== lbl) { lbl = l; if (l) label.textContent = l; gsap.to(label, { autoAlpha: l ? 1 : 0, duration: 0.18, ease: "power2.out", overwrite: "auto" }); }
    };
    let lastMove = performance.now(), speedAcc = 0;
    addEventListener("mousemove", (e) => {
      const { clientX: x, clientY: y } = e;
      const moved = !pointer.ready || x !== pointer.x || y !== pointer.y;
      const now = performance.now();
      if (pointer.ready && moved && !hot) dist += Math.hypot(x - pointer.x, y - pointer.y);
      if (pointer.ready) speedAcc = Math.hypot(x - pointer.x, y - pointer.y) / Math.max(1, now - lastMove) * 1000;
      lastMove = now;
      pointer.x = x; pointer.y = y; pointer.ready = true;
      cur.style.opacity = 1; setX(x); setY(y);
      setHot(e.target);
      if (moved && !hot) {
        if (!anchor) drop(x, y);
        else {
          clearTimeout(stopT);
          stopT = setTimeout(() => { if (!hot && dist >= 100) drop(pointer.x, pointer.y); }, 150);
          if (Date.now() - lastDrop >= 300 && dist >= 100) drop(x, y);
        }
      }
      drawLine();
    }, { passive: true });
    setInterval(() => { stats.speed = speedAcc; speedAcc *= 0.5; }, 200);
    addEventListener("mousedown", () => gsap.to(box, { scale: 0.9, duration: 0.15, ease: "power2.out", overwrite: "auto" }));
    addEventListener("mouseup", () => gsap.to(box, { scale: 1, duration: 0.15, ease: "power2.out", overwrite: "auto" }));
    document.addEventListener("mouseover", (e) => setHot(e.target), { passive: true });
    document.addEventListener("mouseout", (e) => setHot(e.relatedTarget), { passive: true });
    document.addEventListener("mouseleave", () => { cur.style.opacity = 0; });
  }
  addEventListener("click", () => { stats.clicks++; blip(980, 0.03, 0.03); });

  /* ───────── Physics box — matter-js 0.20 (same version as the original). Gravity 1.2, 9.8px boxes, phone starts with 100 and tilt gravity ───────── */
  const cv = document.querySelector(".mc-cubes");
  if (cv && window.Matter) {
    const { Engine, Bodies, Body, Composite, Runner } = Matter;
    const ctx = cv.getContext("2d");
    const max = touch ? 100 : 2000;
    let W = innerWidth, H = innerHeight, dpr = devicePixelRatio || 1, ink = "";
    const engine = Engine.create({ gravity: { x: 0, y: 1.2 } });
    const cubes = [];
    let walls = [];
    const size = () => { W = innerWidth; H = innerHeight; dpr = devicePixelRatio || 1; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const fence = () => {
      if (walls.length) Composite.remove(engine.world, walls);
      const o = { isStatic: true, friction: 0.8, restitution: 0.2 };
      walls = [Bodies.rectangle(W / 2, H + 30, W + 120, 60, o), Bodies.rectangle(-30, H / 2, 60, H + 120, o), Bodies.rectangle(W + 30, H / 2, 60, H + 120, o)];
      if (touch) walls.push(Bodies.rectangle(W / 2, -30, W + 120, 60, o));
      Composite.add(engine.world, walls);
    };
    const cube = (x, y, v) => {
      const b = Bodies.rectangle(x, y, 9.8, 9.8, { restitution: 0.35, friction: 0.6, frictionAir: 0.02 });
      Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.25);
      if (v) Body.setVelocity(b, v);
      return b;
    };
    const push = (x, y, r, f, spin) => {
      for (const b of cubes) {
        const dx = b.position.x - x, dy = b.position.y - y, d = Math.hypot(dx, dy);
        if (d >= r || d <= 0) continue;
        const k = f * (1 - d / r), a = Math.atan2(dy, dx);
        Body.applyForce(b, b.position, { x: Math.cos(a) * k, y: Math.sin(a) * k });
        if (!spin) continue;
        Body.setAngularVelocity(b, b.angularVelocity + (Math.random() - 0.5) * 0.2);
        const sp = Math.hypot(b.velocity.x, b.velocity.y);
        if (sp > 8) Body.setVelocity(b, { x: (b.velocity.x * 8) / sp, y: (b.velocity.y * 8) / sp });
      }
    };
    const spawn = (x, y, v) => {
      if (touch && cubes.length >= max) return;
      const b = cube(x, y, v);
      Composite.add(engine.world, b); cubes.push(b);
      while (!touch && cubes.length > max) Composite.remove(engine.world, cubes.shift());
      blip(300 + Math.random() * 200, 0.03, 0.02);
    };
    MC.cubes = {
      spawn,
      explode: (x, y) => {
        push(x, y, 300, 0.008, true);
        for (let n = 0; n < 10; n++) {
          const a = (2 * Math.PI * n) / 10 + (Math.random() - 0.5) * 0.35, s = 8 * (0.75 + 0.5 * Math.random()), o = 4 * Math.random();
          spawn(x + Math.cos(a) * o, y + Math.sin(a) * o, { x: Math.cos(a) * s, y: Math.sin(a) * s });
        }
      },
    };
    size(); fence();
    if (touch) for (let i = 0; i < 100; i++) { const b = cube(9.8 + Math.random() * Math.max(1, W - 19.6), 9.8 + Math.random() * Math.max(1, 0.35 * H)); cubes.push(b); Composite.add(engine.world, b); }
    const runner = Runner.create();
    Runner.run(runner, engine);
    const tint = () => { ink = `color-mix(in srgb, ${css("--kf-accent")} 88%, ${css("--kf-contrast-ink")})`; };
    tint();
    MC.on("theme", tint);
    if (touch) {
      addEventListener("touchmove", (e) => { const t = e.touches[0]; if (t) push(t.clientX, t.clientY, 150, 0.001); }, { passive: true });
      addEventListener("deviceorientation", (e) => { if (e.beta == null || e.gamma == null) return; engine.gravity.x = 1.2 * Math.sin((e.gamma * Math.PI) / 180); engine.gravity.y = 1.2 * Math.sin((e.beta * Math.PI) / 180); });
    } else {
      document.body.addEventListener("mousemove", (e) => push(e.clientX, e.clientY, 150, 0.001));
      document.body.addEventListener("click", (e) => push(e.clientX, e.clientY, 300, 0.008, true));
    }
    const draw = () => {
      requestAnimationFrame(draw);
      ctx.clearRect(0, 0, W, H);
      if (!cubes.length) return;
      ctx.strokeStyle = ink; ctx.lineWidth = 1.15; ctx.lineJoin = "miter";
      for (const b of cubes) {
        const { x, y } = b.position;
        if (Math.abs(b.angle) < 0.001) ctx.strokeRect(x - 4.9 + 0.575, y - 4.9 + 0.575, 8.65, 8.65);
        else { ctx.save(); ctx.translate(x + 0.575, y + 0.575); ctx.rotate(b.angle); ctx.strokeRect(-4.9, -4.9, 8.65, 8.65); ctx.restore(); }
      }
    };
    draw();
    addEventListener("resize", () => { size(); fence(); });
  }

  /* ───────── Live gauge values ───────── */
  const live = (k) => document.querySelector(`[data-live="${k}"]`);
  const set = (k, v) => { const el = live(k); if (el && el.textContent !== v) el.textContent = v; };
  const pad = (n) => String(n).padStart(2, "0");
  const ua = navigator.userAgent;
  set("browser", /Edg\//.test(ua) ? "EDGE" : /Chrome\//.test(ua) ? "CHROME" : /Product\//.test(ua) ? "FIREFOX" : /Safari\//.test(ua) ? "SAFARI" : "BROWSER");
  set("os", /Mac OS X/.test(ua) ? "MACOS" : /Windows/.test(ua) ? "WINDOWS" : /Android/.test(ua) ? "ANDROID" : /iPhone|iPad/.test(ua) ? "IOS" : "LINUX");
  set("lang", (navigator.language || "ko-KR").toUpperCase());
  const off = -new Date().getTimezoneOffset() / 60;
  set("tz", `UTC${off >= 0 ? "+" : ""}${off}`);
  try { set("region", Intl.DateTimeFormat().resolvedOptions().timeZone.toUpperCase()); } catch (e) { /* Browsers without time zone names */ }
  let frames = 0, fpsAt = performance.now(), lastY = scrollY;
  gsap.ticker.add(() => { frames++; });
  addEventListener("scroll", () => { stats.scroll += Math.abs(scrollY - lastY); lastY = scrollY; }, { passive: true });
  addEventListener("wheel", (e) => { if (innerWidth > 1024) stats.scroll += Math.abs(e.deltaY); }, { passive: true });
  const tick = () => {
    const d = new Date(), s = Math.floor((Date.now() - stats.born) / 1000), now = performance.now();
    set("clock", `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
    set("dur", `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`);
    set("fps", String(Math.round((frames * 1000) / Math.max(1, now - fpsAt)))); frames = 0; fpsAt = now;
    set("speed", `${Math.round(stats.speed)} PX/S`);
    set("scroll", `${Math.round(stats.scroll)} PX`);
    set("clicks", String(stats.clicks)); set("hovers", String(stats.hovers)); set("keys", String(stats.keys));
    set("vp", `${innerWidth} × ${innerHeight}`); set("dpr", `${devicePixelRatio || 1}X`);
  };
  // Original freezes values during the loader (freezeValues) and releases them when the opening ends
  let ticking = 0;
  MC.on("boot", () => { setTimeout(() => { tick(); ticking = setInterval(tick, 1000); }, 3400); });
  addEventListener("keydown", () => { stats.keys++; });

  /* On phone and tablet the windows stack downward, so scroll smoothly with Lenis (original 1.3.25) */
  if (window.Lenis && innerWidth <= 1024 && !reduce) {
    const lenis = new Lenis();
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    MC.lenis = lenis;
  }
})();
