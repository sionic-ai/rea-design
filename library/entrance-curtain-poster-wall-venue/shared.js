// Motion shared by every page — original values: Lenis 1.1.14 (duration 1.2, default exponential curve) driven by the GSAP ticker,
// Uses the duration table (strong 1.2 · strongDecelerate 1 · emphasized .5 · standard .3) and the power3 curve
(() => {
  const D = { strong: 1.2, strongDecelerate: 1, strongAccelerate: 0.8, emphasized: 0.5, emphasizedDecelerate: 0.4, standard: 0.3 };
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)");
  const HOVER = matchMedia("(hover: hover)");
  const DESK = matchMedia("(min-width: 961px)");
  gsap.registerPlugin(ScrollTrigger);
  const st = { lenis: null, D, menuOpen: false, modalOpen: false };

  // ───────── Smooth scroll ─────────
  function lenisInit() {
    st.lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    st.lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => st.lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const hold = () => { if (st.menuOpen || st.modalOpen) st.lenis?.stop(); else st.lenis?.start(); };

  // ───────── Split text ─────────
  function split(el, rise) {
    if (el.dataset.split) return [...el.querySelectorAll(".jt-ch")];
    el.dataset.split = "1";
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          [...n.textContent].forEach((c) => {
            if (c === "\n") return;
            const ch = document.createElement("span");
            ch.className = "jt-ch";
            ch.textContent = c;
            if (rise) { const box = document.createElement("span"); box.className = "jt-ch-box"; box.append(ch); frag.append(box); }
            else frag.append(ch);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR" && n.tagName !== "SVG") walk(n);
      });
    };
    walk(el);
    return [...el.querySelectorAll(".jt-ch")];
  }

  // Interaction response — letters in random order (spread within .3s) fade to .4 over .5s power3.out, and reverse on release
  function hoverText(scope = document) {
    scope.querySelectorAll("[data-jt-hover]:not([data-jt-hover-on])").forEach((a) => {
      a.setAttribute("data-jt-hover-on", "");
      const text = a.querySelector("[data-jt-text]") || a;
      const chars = split(text, false);
      if (!chars.length) return;
      const tl = gsap.timeline({ paused: true }).to(chars, { opacity: 0.4, stagger: { from: "random", amount: D.standard }, duration: D.emphasized, ease: "power3.out" });
      a.addEventListener("pointerover", () => tl.play());
      a.addEventListener("pointerout", () => tl.reverse());
    });
  }

  // Text entrance — when on screen, characters rise one by one from 1em below (.01s apart) over 1s power3.out. data-from="center" From the center of the surface
  function riseText(el, { play = "view" } = {}) {
    el.classList.add("jt-rise");
    const chars = split(el, true);
    const tl = gsap.timeline({ paused: true }).fromTo(chars, { opacity: 0, y: "1em" }, { opacity: 1, y: 0, stagger: { from: el.dataset.from || "start", each: 0.01 }, duration: D.strongDecelerate, ease: "power3.out" });
    if (REDUCE.matches) { tl.progress(1); return tl; }
    if (play === "view") {
      const once = el.dataset.once !== "false";
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) { tl.restart(); if (once) io.disconnect(); }
      }));
      io.observe(el);
    }
    return tl;
  }

  // ───────── Header bar · menu ─────────
  function showHeader() {
    document.querySelectorAll(".jt-header, .jt-burger-box").forEach((h) => h.classList.add("is-view"));
  }
  function menu() {
    const btn = document.querySelector(".jt-burger");
    const scrim = document.querySelector(".jt-scrim");
    const drawer = document.querySelector(".jt-drawer");
    if (!btn || !drawer) return;
    const set = (open) => {
      st.menuOpen = open;
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      scrim?.setAttribute("aria-hidden", String(!open));
      drawer.setAttribute("aria-hidden", String(!open));
      hold();
    };
    btn.addEventListener("click", () => set(!st.menuOpen));
    scrim?.addEventListener("click", () => set(false));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && st.menuOpen) set(false); });
    // Menu link to a section on the same page — moves there with Lenis in 1.2s (locked) and closes the drawer
    drawer.querySelectorAll("[data-jt-goto]").forEach((b) => b.addEventListener("click", () => {
      const t = document.querySelector(b.dataset.jtGoto);
      set(false);
      if (t) st.lenis?.scrollTo(t, { lock: true, force: true, duration: 1.2 });
    }));
  }

  // ───────── Round-rim button drag — 15% toward the mouse in .4s power1.out, on release back to place with back.out(3) ─────────
  function magnet(scope = document) {
    if (!HOVER.matches) return;
    scope.querySelectorAll("[data-jt-magnet]:not([data-jt-magnet-on])").forEach((el) => {
      el.setAttribute("data-jt-magnet-on", "");
      const k = +el.dataset.jtMagnet || 0.15;
      const target = el.querySelector("[data-jt-magnet-part]") || el;
      const dur = +(el.dataset.jtMagnetDur || 0.4);
      const back = el.dataset.jtMagnetBack || "back.out(3)";
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        gsap.to(target, { x: (e.clientX - r.left - r.width / 2) * k, y: (e.clientY - r.top - r.height / 2) * k, duration: dur, ease: "power1.out" });
      });
      el.addEventListener("pointerleave", () => gsap.to(target, { x: 0, y: 0, duration: dur, ease: back, overwrite: true }));
    });
  }

  // ───────── Photo parallax — the image inside the cell (1.16×) moves 8% → −8% while the cell passes through the screen (scrub 1.2) ─────────
  function parallax(scope = document) {
    scope.querySelectorAll("[data-jt-parallax]").forEach((box) => {
      const inner = box.firstElementChild;
      if (!inner || REDUCE.matches) return;
      gsap.fromTo(inner, { y: "8%" }, { y: "-8%", ease: "none", scrollTrigger: { trigger: inner, start: "top bottom", end: "bottom top", scrub: D.strong } });
    });
  }

  // ───────── Video plate — opens floating up in .5s power3.out and stops scrolling ─────────
  function players(scope = document) {
    scope.querySelectorAll("[data-jt-player]").forEach((btn) => {
      const dlg = document.querySelector(btn.dataset.jtPlayer);
      if (!dlg) return;
      const wrap = dlg.querySelector(".jt-player__wrap");
      const video = dlg.querySelector("video");
      const close = () => gsap.to(wrap, { opacity: 0, duration: D.standard, ease: "power3.out", onComplete: () => { video?.pause(); dlg.close(); st.modalOpen = false; hold(); } });
      btn.addEventListener("click", () => {
        dlg.showModal();
        st.modalOpen = true;
        hold();
        gsap.fromTo(wrap, { opacity: 0 }, { opacity: 1, duration: D.emphasized, ease: "power3.out" });
        video?.play().catch(() => {});
      });
      dlg.addEventListener("click", (e) => { if (e.target === wrap || e.target.closest(".jt-close")) close(); });
      dlg.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
    });
  }

  // ───────── Subpage background glow — a six-point polygon picks new positions every 200 frames and follows at .5% per frame, and the panel follows the mouse by 1/8 from screen center over 2s ─────────
  function glow(scope = document) {
    scope.querySelectorAll(".jt-glow").forEach((wrap) => {
      const svg = wrap.querySelector(".jt-glow__noise svg");
      const poly = svg?.querySelector("polygon");
      if (!poly) return;
      const pick = () => Array.from({ length: 6 }, () => ({ x: gsap.utils.random([0, 1, 0.1]), y: gsap.utils.random([0, 1, 0.1]) }));
      const pts = pick();
      let goal = pick(), frame = 0, on = false;
      new IntersectionObserver(([e]) => { on = e.isIntersecting; }).observe(wrap);
      const draw = () => poly.setAttribute("points", pts.map((p) => `${p.x},${p.y}`).join(" "));
      draw();
      if (REDUCE.matches) return;
      gsap.ticker.add(() => {
        if (!on || st.modalOpen) return;
        frame++;
        if (frame % 200 === 0) goal = pick();
        pts.forEach((p, i) => { p.x = gsap.utils.interpolate(p.x, goal[i].x, 0.005); p.y = gsap.utils.interpolate(p.y, goal[i].y, 0.005); });
        draw();
      });
      if (!HOVER.matches) return;
      // The original sets a fresh 2s follow every frame while the hand is over the panel — it keeps approaching even a stopped mouse, and on leaving it finishes the last 2s
      let ev = null;
      wrap.addEventListener("pointerenter", (e) => { ev = e; });
      wrap.addEventListener("pointermove", (e) => { ev = e; });
      wrap.addEventListener("pointerleave", () => { ev = null; });
      gsap.ticker.add(() => { if (ev) gsap.to(svg, { x: (ev.clientX - innerWidth / 2) / 8, y: (ev.clientY - innerHeight / 2) / 8, duration: 2, overwrite: "auto" }); });
    });
  }

  // Sub page entrance — 0 → 1 in 1.2s power3.inOut
  function pageIn() {
    const page = document.querySelector(".jt-page");
    if (!page) return;
    if (REDUCE.matches) { page.style.opacity = 1; return; }
    // Attached after the new document first paints — if attached at document start, the browser holds the previous screen and the early part of the rise-up passes unseen
    requestAnimationFrame(() => requestAnimationFrame(() => gsap.fromTo(page, { opacity: 0 }, { opacity: 1, duration: D.strong, ease: "power3.inOut" })));
  }

  // The original intro curtain plays only on the first document entered on the site (app state) — skipped when arriving via another page in the same tab, and plays again on refresh
  let seen = false;
  try {
    seen = sessionStorage.getItem("jt-seen") === "1" && performance.getEntriesByType("navigation")[0]?.type !== "reload";
    sessionStorage.setItem("jt-seen", "1");
  } catch {}
  const site = { st, D, seen, split, riseText, hoverText, magnet, parallax, players, showHeader, REDUCE, HOVER, DESK };
  window.jtSite = site;

  function start() {
    lenisInit();
    menu();
    hoverText();
    magnet();
    parallax();
    players();
    glow();
    document.querySelectorAll("[data-jt-rise]").forEach((el) => riseText(el));
    if (!document.body.classList.contains("jt-home")) { showHeader(); pageIn(); }
    site.ready = true;
    document.dispatchEvent(new CustomEvent("jt:ready"));
  }
  // Like the original, it starts as soon as the document is up (letter positions follow even if the font comes late since they are inline-block) — once the font arrives, only the scroll positions are re-measured
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", start);
  else start();
})();
