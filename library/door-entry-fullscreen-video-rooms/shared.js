/* Entrance door → five rooms. Original values:
   Room switch transform .65s cubic-bezier(.4,0,.2,1) · wheel deltaY accumulates to 80 for one step (count restarts after a pause over 80ms) · .3s lock after a switch · keys ↑↓←→ PgUp/PgDn · finger 50px · at 810px and below, switches vertically
   Video parallax: follows (cursor − room center) × .03 with a spring (stiffness 200 · damping 40), off on touch and at 768 and below
   Letter focus-in: blur(10px)·y10·transparent → in place, .05s stagger per letter, .6s cubic-bezier(.58,0,.42,1) */
(() => {
  gsap.registerPlugin(CustomEase);
  /* The original (framer-motion) runs on wall-clock time — turning off GSAP’s default lag smoothing (which shrinks gaps over 500ms down to 33ms) keeps the entrance timing identical to the original even on a busy machine */
  gsap.ticker.lagSmoothing(0);
  const EASE = {
    out: CustomEase.create("fh-out", "0.52,0,0.48,1"),
    char: CustomEase.create("fh-char", "0.58,0,0.42,1"),
    room: CustomEase.create("fh-room", "0.4,0,0.2,1"),
    soft: CustomEase.create("fh-soft", "0.44,0,0.56,1"),
  };
  const MOBILE = 810;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isNarrow = () => innerWidth <= MOBILE;

  /* Text splitting — wrap each word in a chunk, and the letters inside it. <em> Keep the same inner styling as is */
  function split(el, by = "char") {
    if (el.dataset.split) return [...el.querySelectorAll(".fh-c")];
    el.dataset.split = by;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 1) return walk(n);
        if (n.nodeType !== 3 || !n.textContent.trim()) return;
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.append(document.createTextNode(part));
          const w = document.createElement("span");
          w.className = "fh-w";
          if (by === "word") { w.classList.add("fh-c"); w.textContent = part; }
          else [...part].forEach((ch) => { const c = document.createElement("span"); c.className = "fh-c"; c.textContent = ch; w.append(c); });
          frag.append(w);
        });
        n.replaceWith(frag);
      });
    };
    walk(el);
    return [...el.querySelectorAll(".fh-c")];
  }
  function charsIn(el, delay = 0, by = "char") {
    if (!el) return null;
    const cs = split(el, by);
    if (reduce) { gsap.set(cs, { clearProps: "all" }); return null; }
    return gsap.fromTo(cs, { filter: "blur(10px)", opacity: 0, y: 10 },
      { filter: "blur(0px)", opacity: 1, y: 0, duration: 0.6, ease: EASE.char, stagger: 0.05, delay, overwrite: true });
  }
  function hideChars(el) { if (el) gsap.set(split(el), { opacity: 0 }); }

  const rooms = [...document.querySelectorAll(".fh-room")];
  const dots = [...document.querySelectorAll(".fh-dot")];
  const gate = document.querySelector(".fh-gate");
  let current = 0, busy = false, cooling = false, acc = 0, lastWheel = 0;
  const seen = new Set();
  let muted = true;

  /* ── Room switch ─────────────────────────── */
  const axis = () => (isNarrow() ? "y" : "x");
  const span = () => (isNarrow() ? innerHeight : innerWidth);
  function place() {
    const a = axis(), o = a === "x" ? "y" : "x";
    rooms.forEach((r, i) => gsap.set(r, { [a]: i === current ? 0 : (i < current ? -span() : span()), [o]: 0 }));
  }
  function setVideo(i) {
    rooms.forEach((r, k) => {
      const v = r.querySelector("video");
      if (!v) return;
      v.muted = muted;
      if (k === i) { const p = v.play(); p && p.catch(() => { v.muted = true; v.play().catch(() => {}); }); }
      else v.pause();
    });
  }
  function mark(i) {
    dots.forEach((d, k) => d.setAttribute("aria-current", k === i ? "true" : "false"));
    document.documentElement.dataset.room = String(i + 1);
  }
  function enterRoom(i, first) {
    const r = rooms[i];
    setVideo(i);
    mark(i);
    if (!seen.has(i)) {
      seen.add(i);
      dispatchEvent(new CustomEvent("fh:roomfirst", { detail: { room: i, el: r, first } }));
    }
    dispatchEvent(new CustomEvent("fh:roomchange", { detail: { room: i, el: r } }));
  }
  function go(next, dir) {
    if (busy || next === current || next < 0 || next >= rooms.length) return;
    busy = true;
    closeCards();
    dispatchEvent(new CustomEvent("fh:roomleave", { detail: { room: current } }));
    const a = axis(), d = dir || Math.sign(next - current) || 1, w = span();
    rooms.forEach((r, k) => { if (k !== current && k !== next) gsap.set(r, { [a]: k < next ? -w : w }); });
    gsap.set(rooms[next], { [a]: d * w });
    const from = current;
    const dur = reduce ? 0 : 0.65;
    gsap.to(rooms[from], { [a]: -d * w, duration: dur, ease: EASE.room });
    gsap.to(rooms[next], { [a]: 0, duration: dur, ease: EASE.room, onComplete: () => {
      current = next; busy = false; acc = 0; cooling = true;
      setTimeout(() => { cooling = false; }, 300);
      enterRoom(next);
    } });
    mark(next);
  }
  window.fhRooms = { go: (i) => go(i, Math.sign(i - current) || 1), get current() { return current; }, split, charsIn, hideChars, EASE, reduce };

  addEventListener("wheel", (e) => {
    if (gate && !gate.hidden) return;
    if (!rooms.some((r) => r.contains(e.target)) && !e.target.closest(".fh-bar")) return;
    e.preventDefault();
    if (e.fhHandled) return;
    if (busy || cooling) { acc = 0; return; }
    const now = Date.now();
    if (now - lastWheel > 80) acc = 0;
    lastWheel = now;
    acc += e.deltaY;
    if (Math.abs(acc) < 80) return;
    const d = Math.sign(acc);
    acc = 0;
    go(current + d, d);
  }, { passive: false });
  addEventListener("keydown", (e) => {
    if (gate && !gate.hidden) return;
    if ([34, 40, 39].includes(e.keyCode)) go(current + 1, 1);
    if ([33, 38, 37].includes(e.keyCode)) go(current - 1, -1);
  });
  let t0 = 0, tOn = false;
  document.addEventListener("touchstart", (e) => {
    tOn = rooms.some((r) => r.contains(e.target));
    if (tOn) t0 = isNarrow() ? e.touches[0].clientY : e.touches[0].clientX;
  }, { passive: true });
  document.addEventListener("touchend", (e) => {
    if (!tOn || (gate && !gate.hidden)) return;
    const t = isNarrow() ? e.changedTouches[0].clientY : e.changedTouches[0].clientX, d = t0 - t;
    if (Math.abs(d) > 50) go(current + Math.sign(d), Math.sign(d));
  });
  dots.forEach((d, k) => d.addEventListener("click", (e) => { e.preventDefault(); go(k, Math.sign(k - current) || 1); }));
  addEventListener("resize", () => { if (!busy) place(); });

  /* ── Video parallax (spring) ───── */
  const touchy = () => "ontouchstart" in window || navigator.maxTouchPoints > 0 || innerWidth <= 768;
  const spring = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
  let last = 0;
  if (!reduce) {
    document.addEventListener("mousemove", (e) => {
      if (touchy()) return;
      spring.tx = (e.clientX - innerWidth / 2) * 0.03;
      spring.ty = (e.clientY - innerHeight / 2) * 0.03;
    });
    gsap.ticker.add(() => {
      /* Integrates in small steps (max 8ms) of wall-clock time — so even with late frames it lands on time like a framer-motion spring */
      const now = performance.now();
      if (!last) last = now;
      let rem = Math.min(0.5, Math.max(1, now - last) / 1000);
      last = now;
      const k = 200, c = 40;
      while (rem > 0) {
        const h = Math.min(rem, 0.008);
        spring.vx += (k * (spring.tx - spring.x) - c * spring.vx) * h;
        spring.vy += (k * (spring.ty - spring.y) - c * spring.vy) * h;
        spring.x += spring.vx * h;
        spring.y += spring.vy * h;
        rem -= h;
      }
      /* Like a framer-motion spring, it snaps to the target once within 0.5px and 2px per second — otherwise the end value stays at 94% of the target */
      if (Math.abs(spring.tx - spring.x) < 0.5 && Math.abs(spring.vx) < 2) { spring.x = spring.tx; spring.vx = 0; }
      if (Math.abs(spring.ty - spring.y) < 0.5 && Math.abs(spring.vy) < 2) { spring.y = spring.ty; spring.vy = 0; }
      const m = rooms[current] && rooms[current].querySelector(".fh-room__media");
      if (m) gsap.set(m, { x: spring.x, y: spring.y });
    });
    /* The original resets the parallax to 0 when the room leaves the screen */
    addEventListener("fh:roomleave", () => {
      spring.x = spring.y = spring.vx = spring.vy = 0;
      rooms.forEach((r) => { const m = r.querySelector(".fh-room__media"); m && gsap.set(m, { x: 0, y: 0 }); });
    });
  }

  /* ── Hotspot card ───────────────────────── */
  function closeCards() {
    document.querySelectorAll(".fh-spot[aria-expanded='true']").forEach((s) => s.setAttribute("aria-expanded", "false"));
    document.querySelectorAll(".fh-card.is-open").forEach((c) => {
      c.classList.remove("is-open");
      gsap.to(c, { autoAlpha: 0, y: 10, duration: reduce ? 0 : 0.3, ease: EASE.soft });
    });
  }
  document.addEventListener("click", (e) => {
    const spot = e.target.closest(".fh-spot");
    if (!spot) { if (!e.target.closest(".fh-card")) closeCards(); return; }
    const card = document.getElementById(spot.getAttribute("aria-controls"));
    const open = spot.getAttribute("aria-expanded") === "true";
    closeCards();
    if (open || !card) return;
    spot.setAttribute("aria-expanded", "true");
    const box = spot.getBoundingClientRect(), host = card.offsetParent.getBoundingClientRect();
    if (!isNarrow()) {
      const x = Math.min(box.left - host.left - 4, host.width - 500);
      card.style.setProperty("--x", `${Math.max(20, x)}px`);
      card.style.setProperty("--y", `${box.bottom - host.top + 14}px`);
    }
    card.classList.add("is-open");
    gsap.fromTo(card, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: reduce ? 0 : 0.6, ease: EASE.out });
    charsIn(card.querySelector(".fh-card__title"), 0.1, "word");
    card.querySelectorAll(".fh-card__body").forEach((b, i) => charsIn(b, 0.3 + i * 0.6, "word"));
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeCards(); });

  /* ── Sound ──────────────────────────────── */
  const sound = document.querySelector(".fh-sound");
  sound && sound.addEventListener("click", () => {
    muted = !muted;
    sound.setAttribute("aria-pressed", String(!muted));
    const v = rooms[current].querySelector("video");
    if (v) v.muted = muted;
  });

  /* ── Entrance door ───────────────────────────── */
  place();
  mark(0);
  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    if (!gate) return;
    const { still } = ctx.conditions;
    const mark = gate.querySelector(".fh-gate__mark"), tiles = gate.querySelectorAll(".fh-strip__tile"), line = gate.querySelector(".fh-strip__line path"), glow = gate.querySelectorAll(".fh-strip__dot"), enter = gate.querySelector(".fh-enter");
    const title = gate.querySelector(".fh-gate__title"), sub = gate.querySelector(".fh-gate__sub"), svg = gate.querySelector(".fh-strip__line");
    if (still) { gsap.set([mark, tiles, enter, title, sub, svg], { opacity: 1 }); return; }
    const narrow = isNarrow();
    /* Text and lines are hidden piece by piece and their parent is shown right away — the parent had been hidden by css to prevent a flicker on first paint */
    split(title); split(sub);
    gsap.set(gate.querySelectorAll(".fh-gate__title .fh-c, .fh-gate__sub .fh-c"), { opacity: 0 });
    gsap.set([title, sub, svg], { opacity: 1 });
    gsap.fromTo(mark, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: EASE.out });
    tiles.forEach((t, i) => gsap.fromTo(t, { opacity: 0, y: narrow ? 20 : 200 }, { opacity: 1, y: 0, duration: 1, delay: 0.4 + i * 0.1, ease: EASE.out }));
    if (line) {
      const len = line.getTotalLength();
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set(glow, { opacity: 0 });
      gsap.to(line, { strokeDashoffset: 0, duration: 0.8, delay: 1.6, ease: EASE.soft });
      gsap.to(glow, { opacity: 1, duration: 0.3, delay: 2.2, ease: EASE.soft });
    }
    charsIn(gate.querySelector(".fh-gate__title"), 3.8);
    charsIn(gate.querySelector(".fh-gate__sub"), 4.2);
    gsap.fromTo(enter, { opacity: 0, scale: 0, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.8, delay: 5, ease: EASE.out });
  });
  /* The first room is already standing under the entrance door — in the original too, the first room’s text and hotspots count from the moment the document opens */
  setTimeout(() => enterRoom(0, true), 100);
  const enterBtn = gate && gate.querySelector(".fh-enter");
  enterBtn && enterBtn.addEventListener("click", () => {
    muted = false;
    sound && sound.setAttribute("aria-pressed", "true");
    setVideo(current);
    gsap.to(gate, { autoAlpha: 0, duration: reduce ? 0 : 1.2, ease: EASE.out, onComplete: () => { gate.hidden = true; } });
    document.documentElement.classList.add("is-entered");
    dispatchEvent(new CustomEvent("fh:enter"));
  });
})();
