// Shared by three pages: local time clock, black curtain page transition, line-mask text reveal, smooth wheel scroll · drag scroll (original formulas).
(() => {
  const { gsap } = window;
  const root = document.documentElement;
  // Turns a skin (--kf-*) color into a value to paint on canvas — paints a single point in any color notation and reads it back as #rrggbb (rgba if alpha is given)
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const cssColor = (name, a) => {
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = getComputedStyle(root).getPropertyValue(name).trim() || "transparent";
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return a === undefined ? `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}` : `rgba(${r},${g},${b},${a})`;
  };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = () => innerWidth <= 600;
  const px = () => (isMobile() ? innerWidth / 375 : Math.min(Math.max(innerWidth, 1440), 2560) / 1440);

  // Original SmoothScroll curve — 1.001 - 2^(-10t) over 1.2s
  const EXPO = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));
  // Original o6 — text line reveal 1.4s
  const o6 = (t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t));
  const bezier = (x1, y1, x2, y2) => {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (t) => ((ax * t + bx) * t + cx) * t;
    const sy = (t) => ((ay * t + by) * t + cy) * t;
    return (x) => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let lo = 0, hi = 1;
      for (let i = 0; i < 24; i++) {
        const mid = (lo + hi) / 2;
        if (sx(mid) < x) lo = mid; else hi = mid;
      }
      return sy((lo + hi) / 2);
    };
  };
  const EASE = {
    hide: bezier(0.15, 0, 0.65, 0),
    show: bezier(0.16, 1, 0.3, 1),
    zoom: bezier(0.87, 0, 0.13, 1),
    exitUI: bezier(0.64, 0, 0.12, 1),
  };

  function startClocks() {
    document.querySelectorAll("[data-clock]").forEach((el) => {
      const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: el.dataset.clock || "Asia/City", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
      const prefix = el.dataset.city || "";
      const target = () => el.querySelector(":scope > .ui-in") || el;
      const tick = () => (target().textContent = prefix + fmt.format(new Date()));
      tick();
      setInterval(tick, 1000);
    });
  }

  function wrapInner(el) {
    let inner = el.querySelector(":scope > .ui-in");
    if (!inner) {
      inner = document.createElement("span");
      inner.className = "ui-in";
      while (el.firstChild) inner.appendChild(el.firstChild);
      el.appendChild(inner);
    }
    el.classList.add("ui-mask");
    return inner;
  }
  function maskUI(els) {
    return els.map((el) => {
      const inner = wrapInner(el);
      gsap.set(inner, { yPercent: 110 });
      return inner;
    });
  }
  // Original revealUI: 1.5s expo.out, gap between items is 0.05 of the total length
  function revealUI(inners, delay = 0, onDone) {
    const n = inners.length;
    const total = 1.5 / (1 - (n - 1) * 0.05);
    gsap.to(inners, {
      yPercent: 0, duration: 1.5, ease: "expo.out", delay, stagger: total * 0.05,
      onComplete: () => {
        inners.forEach((inner) => inner.parentElement.classList.remove("ui-mask"));
        if (onDone) onDone();
      },
    });
  }

  // <br> Each split line gets .line > wrap in .line-inner — lines rise from below line by line
  function splitLines(el) {
    const lines = [[]];
    [...el.childNodes].forEach((node) => {
      if (node.nodeName === "BR") lines.push([]);
      else lines[lines.length - 1].push(node);
    });
    el.textContent = "";
    return lines
      .filter((nodes) => nodes.some((n) => n.textContent.trim() || n.nodeType === 1))
      .map((nodes) => {
        const outer = document.createElement("span");
        outer.className = "line";
        const inner = document.createElement("span");
        inner.className = "line-inner";
        nodes.forEach((n) => inner.appendChild(n));
        outer.appendChild(inner);
        el.appendChild(outer);
        return inner;
      });
  }

  // Page transition — on exit the curtain is 0.4s none, the incoming side lifts it with 1s power2.out and [data-swap] rises with 1.5s expo.out
  const VEIL = { out: 0.4, in: 1 };
  const KEY = "hera-veil";
  let veilIn = false;
  try {
    const nav = performance.getEntriesByType("navigation")[0];
    veilIn = sessionStorage.getItem(KEY) === location.pathname && (!nav || nav.type === "navigate");
    sessionStorage.removeItem(KEY);
  } catch {}
  if (veilIn) root.classList.add("veil-in");

  function enter() {
    if (!veilIn) return;
    document.querySelectorAll("[data-swap]").forEach((el) => {
      const inner = wrapInner(el);
      gsap.fromTo(inner, { yPercent: 110 }, { yPercent: 0, duration: 1.5, ease: "expo.out", onComplete: () => el.classList.remove("ui-mask") });
    });
    gsap.fromTo("[data-veil]", { opacity: 1 }, { opacity: 0, duration: VEIL.in, ease: "power2.out" });
    root.classList.remove("veil-in");
  }

  let leaving = false;
  document.addEventListener("click", (e) => {
    const link = e.target.closest(".menu a[href], a[data-home]");
    if (!link || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const url = new URL(link.href, location.href);
    e.preventDefault();
    if (url.pathname === location.pathname || leaving) return;
    leaving = true;
    document.querySelectorAll(".menu .pill").forEach((p) => p.classList.toggle("is-active", new URL(p.href, location.href).pathname === url.pathname));
    // Lay the layer first and rebuild the pill mask in the next frame (so the layer doesn’t start late while the mask is measured)
    requestAnimationFrame(knockAll);
    try { sessionStorage.setItem(KEY, url.pathname); } catch {}
    if (reduce) return void (location.href = link.href);
    gsap.fromTo("[data-veil]", { opacity: 0 }, { opacity: 1, duration: VEIL.out, ease: "none", onComplete: () => (location.href = link.href) });
  });
  addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    leaving = false;
    gsap.set("[data-veil]", { opacity: 0 });
  });

  // Same behavior as the original SmoothScroll and drag-scroll: the wheel is clamped to ±100, then moves the target by ×1.25, and from the current spot it travels to that target in 1.2s expo.
  // Dragging more than 6px with the mouse follows in the same way by 2x the dragged distance, and touching the top or bottom end resets the drag anchor to that spot
  function smoothScroll() {
    if (reduce) return null;
    const limit = () => document.documentElement.scrollHeight - innerHeight;
    const s = { targetScroll: scrollY, animatedScroll: scrollY, anim: null, time: null, busy: false, locked: false };
    s.scrollTo = (v) => {
      const to = Math.max(0, Math.min(Math.round(v), limit()));
      if (to === s.targetScroll) return;
      s.targetScroll = to;
      s.anim = { from: s.animatedScroll, to, t: 0 };
    };
    s.raf = (now) => {
      const dt = now - (s.time ?? now);
      s.time = now;
      const a = s.anim;
      if (!a) return;
      a.t += dt / 1000;
      const p = Math.min(1, a.t / 1.2);
      s.animatedScroll = a.from + (a.to - a.from) * (p >= 1 ? 1 : EXPO(p));
      s.busy = true;
      scrollTo(0, s.animatedScroll);
      if (p >= 1) { s.anim = null; requestAnimationFrame(() => (s.busy = false)); }
    };
    addEventListener("wheel", (e) => {
      if (e.ctrlKey) return;
      const dy = Math.max(-100, Math.min(100, e.deltaY)) * 1.25;
      if (!dy) return;
      e.preventDefault();
      if (!s.locked) s.scrollTo(s.targetScroll + dy);
    }, { passive: false });
    addEventListener("scroll", () => { if (!s.busy) s.animatedScroll = s.targetScroll = scrollY; }, { passive: true });
    const drag = { down: false, start: null, from: 0, target: 0, prev: 0 };
    addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      e.preventDefault();
      if (e.button !== 0 || e.target.closest("a, button")) return;
      drag.down = s.locked = true;
      drag.start = { x: e.clientX, y: e.clientY };
      drag.from = drag.target = s.targetScroll;
    });
    addEventListener("pointermove", (e) => {
      if (!drag.down || e.pointerType !== "mouse") return;
      const { clientX: x, clientY: y } = e;
      if (Math.abs(x - drag.start.x) <= 6 && Math.abs(y - drag.start.y) <= 6) return;
      root.classList.add("is-dragging");
      if (y > drag.prev && drag.target === 0) drag.start.y = y - drag.from / 2;
      else if (y < drag.prev && drag.target === limit()) drag.start.y = y - (drag.from - limit()) / 2;
      drag.prev = y;
      drag.target = Math.round(Math.max(0, Math.min(-2 * (y - drag.start.y) + drag.from, limit())) * 100) / 100;
      s.scrollTo(drag.target);
    });
    addEventListener("pointerup", () => { drag.down = s.locked = false; root.classList.remove("is-dragging"); });
    return s;
  }

  // Pill text cutout: paints the ink-colored panel with a pill-sized SVG mask (white panel, only letters and dots black) to punch out the letter spots.
  // After fonts have all loaded, rebuild every time the window size changes
  const SVGNS = "http://www.w3.org/2000/svg";
  const ascents = new Map();
  const ascent = (cs) => {
    const font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    if (!ascents.has(font)) { const x = document.createElement("canvas").getContext("2d"); x.font = font; ascents.set(font, x.measureText("H").fontBoundingBoxAscent); }
    return ascents.get(font);
  };
  let knockId = 0;
  const knock = (pill) => {
    pill.querySelector(":scope > .pill-knock")?.remove();
    const w = pill.offsetWidth, h = pill.offsetHeight, box = pill.getBoundingClientRect();
    if (!w) return;
    const k = box.width / w || 1, id = `pill-knock-${++knockId}`;
    const el = (tag, attrs, parent) => { const n = document.createElementNS(SVGNS, tag); Object.entries(attrs).forEach(([a, v]) => n.setAttribute(a, v)); parent && parent.append(n); return n; };
    const svg = el("svg", { class: "pill-knock", width: w, height: h, viewBox: `0 0 ${w} ${h}`, "aria-hidden": "true" });
    const mask = el("mask", { id, maskUnits: "userSpaceOnUse", x: 0, y: 0, width: w, height: h }, el("defs", {}, svg));
    el("rect", { width: w, height: h, fill: "white" }, mask); // Not skin: mask brightness — paints only white areas
    const walker = document.createTreeWalker(pill, NodeFilter.SHOW_TEXT);
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
      const text = t.textContent.trim();
      if (!text || t.parentElement.closest("svg")) continue;
      const r = document.createRange();
      r.selectNodeContents(t);
      const rb = r.getBoundingClientRect(), cs = getComputedStyle(t.parentElement);
      const n = el("text", { x: (rb.left - box.left) / k, y: (rb.top - box.top) / k + ascent(cs), fill: "black" }, mask); // Not a skin: mask brightness — dark areas are cut out
      Object.assign(n.style, { fontFamily: cs.fontFamily, fontWeight: cs.fontWeight, fontSize: cs.fontSize, letterSpacing: cs.letterSpacing });
      n.textContent = cs.textTransform === "uppercase" ? text.toUpperCase() : text;
    }
    const dot = pill.querySelector(".pill-dot");
    if (dot && pill.classList.contains("is-active")) {
      const d = dot.getBoundingClientRect();
      el("ellipse", { cx: (d.left - box.left + d.width / 2) / k, cy: (d.top - box.top + d.height / 2) / k, rx: d.width / 2 / k, ry: d.height / 2 / k, fill: "black" }, mask); // Not skin: mask brightness
    }
    el("rect", { class: "pill-knock-fill", width: w, height: h, rx: parseFloat(getComputedStyle(pill).borderTopLeftRadius) || 0, mask: `url(#${id})` }, svg);
    pill.append(svg);
    pill.classList.add("is-knocked");
  };
  const knockAll = () => document.querySelectorAll(".pill").forEach(knock);
  document.fonts.ready.then(knockAll);
  addEventListener("resize", knockAll);

  // Sound effect: instead of the original sound file, our own short pop (1.2kHz→600Hz 40ms, volume .2) plays at the same moments as the original (link·button press, when work changes).
  // Cut the previous sound and play a new one. While the browser blocks sound (before a click) it passes silently.
  const sound = (() => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return { play() {} };
    const ctx = new Ctx();
    let src = null;
    const unlock = () => ctx.state === "suspended" && ctx.resume().catch(() => {});
    addEventListener("pointerdown", unlock, { passive: true });
    addEventListener("keydown", unlock);
    document.addEventListener("visibilitychange", () => (document.hidden ? ctx.suspend() : ctx.resume()).catch(() => {}));
    return {
      play() {
        if (ctx.state !== "running") return;
        try { src?.stop(); } catch {}
        const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
        o.frequency.setValueAtTime(1200, t);
        o.frequency.exponentialRampToValueAtTime(600, t + 0.04);
        g.gain.setValueAtTime(0.2, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        o.connect(g).connect(ctx.destination);
        o.start(t); o.stop(t + 0.07);
        src = o;
      },
    };
  })();
  document.addEventListener("click", (e) => e.target.closest("a[href], button") && sound.play());

  window.H = { cssColor, sound, reduce, isMobile, px, o6, bezier, EASE, maskUI, revealUI, splitLines, wrapInner, enter, smoothScroll, get arrivingByVeil() { return veilIn; } };

  startClocks();
})();
