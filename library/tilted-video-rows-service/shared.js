// Motion shared by the pages: Lenis 1.1.17 (default lerp .1), loader (original order as is — logo and circle 1.2s, progress line after 1.6s, number 2s, top and bottom panels split apart 1s expo.inOut),
// Header bar color switch (past the hero body.is-active), menu panel (.2s transparent), marquee (runs only when visible), contact pill and link text swap, footer entrance.
// Page scripts are registered via AM.page(fn), and when the loader finishes, the enter() and fv() that fn returned are called at the original timing.
(() => {
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none)").matches;
  const pc = () => innerWidth >= 768;
  const clamp = (v, a, b) => Math.max(a, Math.min(v, b));
  const rem = () => innerWidth * (pc() ? 0.00625 : 0.026667);
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const ease = (pts, name) => CustomEase.create(name, `M0,0 C${pts} 1,1`);
  const E = { nt: ease("0.87,0,0.03,1", "am-nt"), ja: ease("0.57,0,0.03,1", "am-ja"), ei: ease("0.57,0,0.13,1", "am-ei"), oi: ease("0.57,0.1,0.03,1", "am-oi") };
  const pages = [];
  const AM = (window.AM = { page: (fn) => pages.push(fn), E, rem, pc, clamp, reduce, touch, lenis: null, scroll: { y: 0 }, onScroll: [], wait: (on) => {
    html.classList.toggle("is-wait", on);
    if (on) AM.lenis?.stop(); else AM.lenis?.start();
  } });

  // ── Lenis — original uses default options as is
  if (!reduce) {
    const lenis = (AM.lenis = new Lenis());
    lenis.on("scroll", (l) => { AM.scroll.y = l.animatedScroll; AM.onScroll.forEach((f) => f(l)); ScrollTrigger.update(); });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else addEventListener("scroll", () => { AM.scroll.y = scrollY; AM.onScroll.forEach((f) => f({ animatedScroll: scrollY, direction: 0 })); }, { passive: true });

  // ── Call when visible (original iObserver)
  AM.watch = (el, on, off) => {
    const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? on?.() : off?.())), { threshold: 0 });
    io.observe(el);
    return io;
  };

  // ── Header line color — body.is-active once it passes the hero (data-switch) height −1
  const trigger = document.querySelector("[data-switch]");
  const color = () => { if (trigger) document.body.classList.toggle("is-active", AM.scroll.y > trigger.getBoundingClientRect().height - 1); };
  AM.onScroll.push(color);

  // ── Menu panel — open/close .2s none (original), close with Esc and focus stays inside the panel ──
  const nav = document.querySelector(".am-nav");
  const openBtn = document.querySelector(".am-header__menu");
  const closeBtn = nav?.querySelector(".am-nav__close");
  if (nav && openBtn) {
    const parts = () => [openBtn, closeBtn, nav.querySelector(".am-nav__content"), nav.querySelectorAll(".am-nav__link")];
    let open = false, last = null;
    const set = (v) => {
      open = v;
      const [o, c, content, links] = parts();
      gsap.killTweensOf([o, c, content, ...links]);
      nav.setAttribute("aria-hidden", String(!v));
      openBtn.setAttribute("aria-expanded", String(v));
      const d = reduce ? 0 : 0.2;
      gsap.to(o, { opacity: v ? 0 : 1, duration: d, ease: "none" });
      gsap.to(c, { autoAlpha: v ? 1 : 0, duration: d, ease: "none" });
      gsap.to(content, { opacity: v ? 1 : 0, duration: d, ease: "none" });
      gsap.to(links, { autoAlpha: v ? 1 : 0, duration: d, ease: "none", onComplete: () => { if (v) nav.querySelector(".am-nav__link")?.focus(); } });
      if (v) last = document.activeElement; else last?.focus?.();
    };
    openBtn.addEventListener("click", () => set(true));
    closeBtn.addEventListener("click", () => set(false));
    nav.querySelectorAll(".am-nav__link").forEach((a) => a.addEventListener("click", () => set(false)));
    addEventListener("keydown", (e) => { if (open && e.key === "Escape") set(false); });
    // Close button hover — two layers of X lines slide in turn and swap (1s expo.out, .05s per line)
    if (!touch) closeBtn.addEventListener("mouseenter", () => {
      closeBtn.querySelectorAll(".am-close__line").forEach((line, i) => {
        const r = line.querySelectorAll(".am-close__inner");
        gsap.killTweensOf(r);
        gsap.set(r[0], { x: 0, clipPath: "inset(0% 0% 0% 0%)" });
        gsap.set(r[1], { x: "-121%", clipPath: "inset(0% 0% 0% 101%)" });
        gsap.to(r[0], { x: "121%", clipPath: "inset(0% 101% 0% 0%)", duration: 1, delay: 0.05 * (i + 1), ease: "expo.out" });
        gsap.to(r[1], { x: "0%", clipPath: "inset(0% 0% 0% 0%)", duration: 1, delay: 0.1 * (i + 1), ease: "expo.out" });
      });
    });
  }

  // ── Swap two copies of text · arrow (original data-link-hover) — front copy −100%, back copy 100%→0, underline from the left. On release snaps back at once, only the underline folds in 1s
  if (!touch) document.querySelectorAll("[data-swap]").forEach((el) => {
    const t = el.querySelectorAll("[data-swap-text]"), a = el.querySelectorAll("[data-swap-arrow]"), line = el.querySelector("[data-swap-line]");
    const diag = el.dataset.swap === "diagonal";
    if (t.length > 1) gsap.set(t[1], { yPercent: 100 });
    if (a.length > 1) gsap.set(a[1], diag ? { xPercent: -100, yPercent: 100 } : { yPercent: 100 });
    if (line) gsap.set(line, { scaleX: 0, transformOrigin: "right" });
    let busy = false, over = false;
    const enter = () => {
      busy = true;
      if (t.length > 1) { gsap.to(t[0], { yPercent: -100, duration: 1, ease: "expo.out" }); gsap.to(t[1], { yPercent: 0, duration: 1, ease: "expo.out" }); }
      if (a.length > 1) { gsap.to(a[0], diag ? { xPercent: 100, yPercent: -100, duration: 1, ease: "expo.out" } : { yPercent: -100, duration: 1, ease: "expo.out" }); gsap.to(a[1], { xPercent: 0, yPercent: 0, duration: 1, ease: "expo.out" }); }
      if (line) gsap.to(line, { scaleX: 1, transformOrigin: "left", duration: 1, ease: "expo.out" });
      gsap.delayedCall(1, () => { busy = false; if (!over) leave(); });
    };
    const leave = () => {
      if (t.length > 1) { gsap.killTweensOf(t); gsap.set(t[0], { yPercent: 0 }); gsap.set(t[1], { yPercent: 100 }); }
      if (a.length > 1) { gsap.killTweensOf(a); gsap.set(a[0], { xPercent: 0, yPercent: 0 }); gsap.set(a[1], diag ? { xPercent: -100, yPercent: 100 } : { yPercent: 100 }); }
      if (line) gsap.to(line, { scaleX: 0, transformOrigin: "right", duration: 1, ease: "expo.out" });
    };
    el.addEventListener("mouseenter", () => { over = true; if (!busy) enter(); });
    el.addEventListener("mouseleave", () => { over = false; if (!busy) leave(); });
  });

  // ── Marquee — runs when visible, pauses when not
  document.querySelectorAll(".am-marquee").forEach((m) => AM.watch(m, () => m.classList.add("is-in-view"), () => m.classList.remove("is-in-view")));

  // ── Video row stage — tilted 15° and each row offset in the opposite direction by (±dX, ±dY) rem (rem units, as in the original)
  AM.rows = (rows) => {
    const a = (15 * Math.PI) / 180, r = 0.15;
    const dX = innerWidth * r * Math.cos(a), dY = innerWidth * r * Math.sin(a);
    rows.forEach((row, i) => gsap.set(row, { x: `${i % 2 ? -dX : dX}rem`, y: `${i % 2 ? -dY : dY}rem`, rotate: 15 }));
    return (dur = 3, e = E.oi) => rows.forEach((row, i) => gsap.to(row, { x: `${i % 2 ? dX : -dX}rem`, y: `${i % 2 ? dY : -dY}rem`, duration: dur, ease: e }));
  };

  // ── Footer — once when visible: the panel unfolds roundly from bottom center (1.4s), and text and links rise from below (d .48)
  const footer = document.querySelector(".am-footer");
  if (footer && !reduce) {
    const top = footer.querySelector(".am-footer__top");
    const logo = footer.querySelector(".am-footer__logo svg"), label = footer.querySelector(".am-footer__label > span");
    const links = [...footer.querySelectorAll(".am-footer__link > span")];
    const rows = [...footer.querySelectorAll(".am-stage__row")];
    const word = [...footer.querySelectorAll(".am-footer__wordmark text")];
    const copyLine = footer.querySelector(".am-footer__copyline"), copy = footer.querySelectorAll(".am-footer__copytext, .am-footer__right > span");
    gsap.set(top, { clipPath: "inset(100% 50% 0% round 1.5rem)" });
    gsap.set([logo, label, ...links, ...copy], { yPercent: 100 });
    gsap.set(copyLine, { scaleX: 0, transformOrigin: "left" });
    gsap.set(word, { opacity: 0 });
    const go = AM.rows(rows);
    const io = AM.watch(footer, () => {
      io.disconnect();
      const d = 0.48, n = links.length;
      gsap.to(top, { clipPath: "inset(0% 0% 0% round 1.5rem)", duration: 1.4, ease: "expo.out" });
      gsap.to(logo, { yPercent: 0, duration: 1.2, delay: d + 0.36, ease: "expo.out" });
      gsap.to(label, { yPercent: 0, duration: 1.2, delay: d + 0.36, ease: "expo.out" });
      links.forEach((l, i) => gsap.to(l, { yPercent: 0, duration: 1.2, delay: d + 0.06 * (n - 1 - i) + 0.06, ease: "expo.out" }));
      gsap.to(copyLine, { scaleX: 1, duration: 1.2, delay: d, ease: "expo.out" });
      gsap.to(copy, { yPercent: 0, duration: 1.2, delay: d, ease: "expo.out" });
      word.forEach((w) => {
        const r = Math.random() * word.length * 0.05;
        gsap.timeline({ delay: d + r }).to(w, { opacity: 1, duration: 0.2, ease: "expo.out" }).to(w, { opacity: 0, duration: 0.1, ease: "expo.out" }, 0.2).to(w, { opacity: 1, duration: 0.1, ease: "expo.out" }, 0.3);
      });
      go(3, "expo.out");
    });
  }

  // ── Loader (only on the first page). If absent, start the page right away
  const loader = document.querySelector(".am-loader");
  const start = () => pages.forEach((fn) => { const api = fn(AM) || {}; AM.api = api; });
  const boot = () => {
    start();
    if (!loader || reduce) {
      loader?.classList.add("is-done");
      AM.api?.fv?.();
      AM.api?.enter?.();
      color();
      return;
    }
    AM.wait(true);
    history.scrollRestoration = "manual";
    scrollTo(0, 0);
    const q = (s) => loader.querySelector(s);
    const logo = q(".am-loader__logo"), circle = q(".am-loader__circle"), line = q(".am-loader__dot"), solid = q(".am-loader__solid"), mask = q(".am-loader__mask");
    const text = q(".am-loader__text"), num = q(".am-loader__num"), top = q(".am-loader__bg-top"), bottom = q(".am-loader__bg-bottom");
    const t = rem(), e = pc() ? clamp(16 * t, 120, 200) : 10 * t, i = pc() ? clamp(14 * t, 105, 175) : 9 * t, s = pc() ? 7 * t : 6 * t, r = pc() ? 4 * t : 2 * t;
    gsap.set(logo, { yPercent: 115 });
    gsap.set(circle, { scale: 0 });
    gsap.set(line, { scaleX: 1, transformOrigin: "right" });
    gsap.set(solid, { scaleX: 0, transformOrigin: "left" });
    gsap.set(mask, { scaleX: 1, transformOrigin: "right" });
    gsap.set(text, { x: -innerWidth + innerWidth * (pc() ? 0.05 : 0.101333) + text.clientWidth, yPercent: 100 });
    AM.api?.preload?.();
    gsap.to(logo, { yPercent: 0, duration: 1.2, ease: "expo.out" });
    gsap.to(circle, { scale: 1, duration: 1.2, ease: "expo.out" });
    gsap.to(text, { yPercent: 0, duration: 1.2, ease: "expo.out" });
    const spin = gsap.to(circle, { rotation: 360, duration: 0.3, ease: "none", repeat: -1, paused: true });
    const progress = { v: 0 };
    gsap.delayedCall(1.6, () => {
      spin.play();
      gsap.to(line, { scaleX: 0, duration: 0.7, delay: 1.8, ease: "expo.out" });
      gsap.to(solid, { scaleX: 1, duration: 0.8, delay: 1, ease: "cubic.out" });
      gsap.to(mask, { scaleX: 0, duration: 2, ease: "cubic.out" });
      gsap.to(text, { x: 0, duration: 2, ease: "cubic.out" });
      // No images or video to download, so progress is immediately 1 — as in the original completeAnimation, the number counts to 100 over 2s sine.out
      gsap.to(progress, { v: 1, duration: 2, ease: "sine.out", onUpdate: () => (num.textContent = Math.floor(progress.v * 100)), onComplete: () => {
        gsap.to(text, { yPercent: 100, duration: 1, delay: 0.2, ease: "expo.out" });
        AM.api?.reveal?.();
        gsap.delayedCall(2, () => AM.api?.enter?.());
        gsap.delayedCall(0.5, () => {
          gsap.to(logo, { y: -(s - r), scale: i / e, transformOrigin: "center left", duration: 1, delay: 0.5, ease: "expo.out" });
          gsap.to(circle, { scale: 0, duration: 1, delay: 0.5, ease: "expo.out", onComplete: () => { spin.kill(); loader.classList.add("is-done"); AM.wait(false); } });
          gsap.to(top, { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "expo.inOut", onStart: () => { AM.api?.header?.(); AM.api?.fv?.(); } });
          gsap.to(bottom, { clipPath: "inset(100% 0 0 0)", duration: 1, ease: "expo.inOut" });
        });
      } });
    });
  };
  const fonts = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]) : Promise.resolve();
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", () => fonts.then(boot)) : fonts.then(boot);
})();
