// Motion of always-floating things — the original values (TIMING · LAG 3 · tilt 1-exp(-7dt) · letter scramble 42ms · drawer .62/.42s) are carried over as is.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const handheld = matchMedia("(hover: none), (pointer: coarse)").matches || innerWidth <= 768;
  gsap.registerPlugin(ScrollTrigger);

  // Skin variable to rgb (since canvas and three can’t read computed color-mix values)
  const probe = document.createElement("i");
  probe.style.display = "none";
  document.body.append(probe);
  const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  px.canvas.width = px.canvas.height = 1;
  const color = (v) => {
    probe.style.color = `var(${v})`;
    px.clearRect(0, 0, 1, 1); px.fillStyle = getComputedStyle(probe).color; px.fillRect(0, 0, 1, 1);
    const [r, g, b] = px.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  };

  const lenis = reduce ? null : new Lenis({ lerp: 0.1 });
  if (lenis) { lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
  const scrollY = () => (lenis ? lenis.animatedScroll : window.scrollY);
  window.IM = { color, reduce, handheld, lenis, scrollY };

  // ───── Text scramble — wrap words · letters, and after each letter’s stagger turn, for the settle duration it swaps symbols every 42ms while the blur clears ─────
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#%&/\\<>{}[]*+=$§";
  const wrap = (el) => {
    if (el.dataset.imWrapped) return;
    el.dataset.imWrapped = "1";
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 1) return walk(n);
        if (n.nodeType !== 3 || !n.textContent) return;
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).filter(Boolean).forEach((part) => {
          if (/^\s+$/.test(part)) return frag.append(document.createTextNode(part));
          const w = document.createElement("span"); w.className = "im-w";
          [...part].forEach((ch) => { const c = document.createElement("span"); c.className = "im-c"; const r = document.createElement("span"); r.className = "im-r"; r.textContent = ch; c.append(r); w.append(c); });
          frag.append(w);
        });
        n.replaceWith(frag);
      });
    };
    walk(el);
  };
  const scramble = (el, { stagger = 26, settle = 420, blur = 7, delay = 0, hold = 0, mode = "scramble", duration = 620 } = {}) => {
    if (reduce) return;
    if (mode === "fade") {
      el.style.transition = "none"; el.style.opacity = "0"; el.style.filter = `blur(${blur}px)`; void el.offsetWidth;
      el.style.transition = `opacity ${duration}ms ease-out ${delay}ms, filter ${duration}ms ease-out ${delay}ms`;
      el.style.opacity = "1"; el.style.filter = "blur(0px)";
      return;
    }
    wrap(el);
    const chars = [...el.querySelectorAll(".im-c")].map((c, i) => ({ el: c, seed: 7919 * i }));
    if (el._raf) cancelAnimationFrame(el._raf);
    chars.forEach((c) => { c.el.style.opacity = "0"; c.done = false; });
    const t0 = performance.now() + delay;
    const step = (now) => {
      let live = false;
      chars.forEach((c, i) => {
        if (c.done) return;
        const a = (now - t0 - hold - i * stagger) / settle;
        if (a < -1) { live = true; return; }
        if (a >= 1) { c.done = true; delete c.el.dataset.g; c.el.style.opacity = ""; c.el.style.filter = ""; return; }
        live = true;
        const tick = Math.floor((now + c.seed) / 42);
        if (tick !== c.tick) { c.tick = tick; c.el.dataset.g = GLYPHS[(Math.imul(tick + c.seed, 0x9e3779b1) >>> 0) % GLYPHS.length]; }
        const h = a < 0 ? 0 : a;
        c.el.style.opacity = String(Math.min(1, a + 1));
        c.el.style.filter = `blur(${(blur * (1 - h) * (1 - h)).toFixed(2)}px)`;
      });
      el._raf = live ? requestAnimationFrame(step) : 0;
    };
    el._raf = requestAnimationFrame(step);
  };
  window.IM.scramble = scramble;
  // On hover — replays each time you enter a button or link (.016s stagger · 280ms · 4px blur)
  document.querySelectorAll('[data-im-scramble="hover"]').forEach((el) => {
    wrap(el);
    const host = el.closest("button, a") || el;
    host.addEventListener("pointerenter", () => scramble(el, { stagger: 16, settle: 280, blur: 4 }));
    host.addEventListener("focus", () => scramble(el, { stagger: 16, settle: 280, blur: 4 }));
  });
  // When visible — once over 35% enters (hero after entrance). Like the original, each letter holds .12s of blur and then clears it
  const viewEls = [...document.querySelectorAll('[data-im-scramble="view"]')];
  viewEls.forEach((el) => { if (el.dataset.mode !== "fade") wrap(el); if (!reduce) el.style.opacity = "0"; });
  const playView = (el) => { el.style.opacity = ""; scramble(el, { delay: +(el.dataset.delay || 0), hold: 120, mode: el.dataset.mode || "scramble", blur: el.dataset.mode === "fade" ? 5 : 7 }); };
  let entered = false;
  const io = new IntersectionObserver((ents) => ents.forEach((e) => {
    if (!entered || e.intersectionRatio < 0.35 || e.target.dataset.played) return;
    e.target.dataset.played = "1"; playView(e.target);
  }), { threshold: [0, 0.35, 1] });
  viewEls.forEach((el) => io.observe(el));
  const replayVisible = () => viewEls.forEach((el) => { const r = el.getBoundingClientRect(); if (!el.dataset.played && r.bottom > 0 && r.top < innerHeight) { el.dataset.played = "1"; playView(el); } });

  // ───── Loader → entrance gate → enter ─────
  const pre = document.querySelector(".im-pre"), swap = pre.querySelector(".im-pre__swap"), count = pre.querySelector(".im-pre__count");
  root.classList.add("is-locked"); lenis?.stop();
  const T = { hold: 0.35, at: { nav: 0.18, rail: 0.46, hero: 0.32, scene: 0, vignette: -0.09 }, dur: { lift: 1.26, scene: 0.96 }, unlock: 1.4, gone: 1.2 };
  // .18s after pressing, the button group starts blurring over .65s, .57s later the group leaves upward and .1s after that the button hides entirely, and the header · contents · first title rise (original measured values)
  const enter = () => {
    if (entered) return;
    entered = true;
    setTimeout(() => swap.classList.add("is-leaving"), 180);
    setTimeout(() => {
      pre.dataset.stage = "lift";
      root.setAttribute("data-scene-in", "");
      setTimeout(() => root.setAttribute("data-vignette-in", ""), Math.max(0, T.at.vignette) * 1000);
      root.setAttribute("data-ui-in", "");
      setTimeout(() => replayVisible(), T.at.hero * 1000);
      setTimeout(() => { root.classList.remove("is-locked"); lenis?.start(); }, T.unlock * 1000);
      setTimeout(() => (pre.dataset.stage = "gone"), T.gone * 1000);
    }, reduce ? 0 : 570);
  };
  pre.querySelectorAll("[data-im-enter]").forEach((b) => b.addEventListener("click", enter));
  // The number fills until images·fonts are all in, and once full it rests .35s then turns into a button
  const load = { v: 0 };
  Promise.all([document.fonts.ready, new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r)))]).then(() => {
    gsap.to(load, { v: 100, duration: reduce ? 0 : 1.2, ease: "power2.inOut", onUpdate: () => (count.textContent = Math.round(load.v)), onComplete: () => setTimeout(() => (swap.dataset.ready = ""), T.hold * 1000) });
  });
  gsap.to(load, { v: 60, duration: reduce ? 0 : 0.9, ease: "power1.out", onUpdate: () => (count.textContent = Math.round(load.v)) });

  // Text panel — flows at 1/3 of scroll (LAG 3) and bends by speed (±4°), shifts 10% sideways when the drawer opens
  const LAG = 3;
  let vel = 0, lastY = scrollY(), lastT = performance.now(), panelShift = 0;
  const frames = [...document.querySelectorAll("[data-im-frame]")].map((el) => ({ el, sec: el.closest("section"), p: 0, m: 0, g: 0, v: 0, hid: null }));
  const measure = () => {
    const vh = innerHeight;
    frames.forEach((f) => {
      const r = f.sec.getBoundingClientRect(), top = r.top + window.scrollY;
      f.p = handheld ? top : top + Math.min(vh, f.sec.offsetHeight - vh);
      // Pinned text panel (long section) — after arriving in place it stays at 0 until the section ends, then flows again
      f.pin = f.el.hasAttribute("data-im-pin"); f.hold = top + f.sec.offsetHeight - vh;
      f.m = f.el.offsetHeight || vh;
    });
  };
  if (!reduce && !handheld) {
    measure();
    addEventListener("resize", measure);
    new ResizeObserver(measure).observe(document.documentElement);
    frames.forEach((f) => { f.y = gsap.quickSetter(f.el, "y", "px"); f.sk = gsap.quickSetter(f.el, "skewY", "deg"); f.xp = gsap.quickSetter(f.el, "xPercent"); });
    gsap.ticker.add(() => {
      const now = performance.now(), y = scrollY(), dt = Math.max(1, now - lastT);
      vel = ((y - lastY) / dt) * 1000; lastY = y; lastT = now;
      const vh = innerHeight;
      const sk = Math.round(100 * Math.max(-4, Math.min(4, (vel / 1000) * 1.2))) / 100;
      frames.forEach((f) => {
        const raw = f.pin ? (y <= f.p ? f.p - y : y <= f.hold ? 0 : f.hold - y) : f.p - y;
        const o = Math.round((100 * raw) / LAG) / 100;
        // No bending while held in place (original i/50 form)
        f.y(o); f.sk(f.pin ? sk * Math.min(1, Math.abs(raw) / 50) : sk); f.xp(panelShift);
        const hid = o + f.m <= -4 || o >= vh + 4;
        if (hid !== f.hid) { f.hid = hid; f.el.style.visibility = hid ? "hidden" : ""; }
      });
    });
  }

  // ───── Cursor tilt — follows with 1-exp(-7dt), x 5px · y -5px · rotation 1° ─────
  const tilts = [...document.querySelectorAll("[data-im-tilt]")];
  if (!reduce && !handheld && tilts.length) {
    const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    let last = performance.now();
    const sets = tilts.map((t) => { gsap.set(t, { transformPerspective: 1000 }); return gsap.quickSetter(t, "css"); });
    addEventListener("pointermove", (e) => { target.x = (e.clientX / innerWidth) * 2 - 1; target.y = -((e.clientY / innerHeight) * 2) + 1; }, { passive: true });
    gsap.ticker.add(() => {
      const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
      const k = 1 - Math.exp(-7 * dt);
      cur.x += (target.x - cur.x) * k; cur.y += (target.y - cur.y) * k;
      if (Math.abs(target.x - cur.x) < 1e-4) cur.x = target.x;
      if (Math.abs(target.y - cur.y) < 1e-4) cur.y = target.y;
      sets.forEach((s) => s({ x: 5 * cur.x, y: -5 * cur.y, rotationY: cur.x, rotationX: cur.y }));
    });
  }

  // ───── Section index — the border cell slides to the current section ─────
  const list = document.querySelector(".im-rail__list"), items = [...list.querySelectorAll(".im-rail__item")];
  const anchors = items.map((b) => document.querySelector(b.dataset.target));
  // Original landingOf — the text board lands in place (section top + min(screen, section height − screen)), 6 gutters before it
  const gutter = () => parseFloat(getComputedStyle(root).getPropertyValue("--im-gutter")) || 0;
  const landing = (el) => Math.max(0, el.getBoundingClientRect().top + window.scrollY + Math.max(0, Math.min(innerHeight, el.offsetHeight - innerHeight)) - 6 * gutter());
  let active = -1;
  const markTo = (i) => {
    const b = items[i], lr = list.getBoundingClientRect(), r = b.getBoundingClientRect();
    list.style.setProperty("--mark-x", `${r.left - lr.left}px`); list.style.setProperty("--mark-y", `${r.top - lr.top}px`);
    list.style.setProperty("--mark-w", `${r.width}px`); list.style.setProperty("--mark-h", `${r.height}px`);
  };
  const railTick = () => {
    const y = window.scrollY;
    let i = 0;
    anchors.forEach((a, k) => { if (a && landing(a) - innerHeight * 0.75 <= y) i = k; });
    if (i !== active) { active = i; items.forEach((b, k) => (b.dataset.state = k === i ? "active" : "idle")); markTo(i); requestAnimationFrame(() => list.setAttribute("data-live", "")); }
  };
  addEventListener("scroll", railTick, { passive: true }); addEventListener("resize", () => markTo(Math.max(0, active)));
  railTick();
  items.forEach((b, k) => b.addEventListener("click", () => { const a = anchors[k]; if (!a) return; const top = Math.max(0, landing(a)); lenis ? lenis.scrollTo(top, { duration: 1.6 }) : scrollTo({ top, behavior: "smooth" }); }));
  addEventListener("scroll", () => root.classList.toggle("is-scrolled", window.scrollY > 40), { passive: true });
  document.querySelector(".im-cue__btn").addEventListener("click", () => { const a = anchors[1]; if (a) lenis ? lenis.scrollTo(landing(a), { duration: 1.6 }) : scrollTo({ top: landing(a), behavior: "smooth" }); });
  document.querySelector(".im-nav__brand").addEventListener("click", (e) => { e.preventDefault(); lenis ? lenis.scrollTo(0, { duration: 1.6 }) : scrollTo({ top: 0, behavior: "smooth" }); });

  // ───── Drawer ─────
  const panel = document.querySelector(".im-panel"), titleEl = panel.querySelector("[data-im-title]"), countEl = panel.querySelector(".im-panel__count");
  const PANELS = [...document.querySelectorAll(".im-sec__title")].map((h) => h.textContent.trim());
  let idx = 0;
  const fill = () => { titleEl.textContent = PANELS[idx] || ""; countEl.textContent = `${String(idx + 1).padStart(2, "0")}/${String(PANELS.length).padStart(2, "0")}`; };
  const shiftTo = (v) => gsap.to({ v: panelShift }, { v, duration: v ? 0.62 : 0.42, ease: "power3.out", onUpdate() { panelShift = this.targets()[0].v; } });
  const open = (i) => { idx = i; fill(); panel.classList.add("is-open"); root.classList.add("is-panel"); lenis?.stop(); shiftTo(10); };
  const close = () => { panel.classList.remove("is-open"); root.classList.remove("is-panel"); lenis?.start(); shiftTo(0); };
  document.querySelectorAll("[data-im-panel]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); open(+a.dataset.imPanel); }));
  panel.querySelector(".im-panel__scrim").addEventListener("click", close);
  panel.querySelector(".im-panel__close").addEventListener("click", close);
  panel.querySelectorAll("[data-step]").forEach((b) => b.addEventListener("click", () => { idx = (idx + +b.dataset.step + PANELS.length) % PANELS.length; fill(); }));
  addEventListener("keydown", (e) => e.key === "Escape" && panel.classList.contains("is-open") && close());

  // ───── Language button ─────
  document.querySelectorAll(".im-lang").forEach((l) => {
    const t = l.querySelector(".im-lang__trigger");
    t.addEventListener("click", (e) => { e.stopPropagation(); l.classList.toggle("is-open"); });
    l.querySelectorAll(".im-lang__opt").forEach((o) => o.addEventListener("click", () => { l.querySelectorAll(".im-lang__opt").forEach((x) => x.classList.toggle("is-on", x === o)); t.firstElementChild.textContent = o.textContent; l.classList.remove("is-open"); }));
    document.addEventListener("click", () => l.classList.remove("is-open"));
  });
})();
// Sound button: starts with the value chosen at entry, and only the text changes with each press
(() => {
  const b = document.querySelector(".im-sound");
  if (!b) return;
  const set = (on) => { b.setAttribute("aria-pressed", String(on)); b.firstElementChild.textContent = on ? "Sound On" : "Sound Off"; };
  document.querySelectorAll("[data-im-enter]").forEach((e) => e.addEventListener("click", () => set(e.dataset.imEnter === "sound")));
  b.addEventListener("click", () => set(b.getAttribute("aria-pressed") !== "true"));
})();
