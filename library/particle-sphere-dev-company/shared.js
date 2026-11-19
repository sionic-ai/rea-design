// Always-on pieces — Lenis smooth scroll, first entry (g-ready), paragraph rise, big heading fit-to-width, scroll hint, consultation and privacy modals
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Size the text so the big title fills 90% of the header’s inner width and the single line below fills 40% (901px and up)
  const fit = (el, ref, share, min, max) => {
    if (!el) return;
    if (innerWidth <= 900) { el.style.fontSize = ""; return; }
    const hero = el.closest(".g-hero");
    const cs = getComputedStyle(hero);
    const avail = hero.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (avail <= 0) return;
    el.style.fontSize = ref + "px";
    const target = el.querySelector(".g-run") || el;
    const w = target.getBoundingClientRect().width;
    if (!w) return;
    el.style.fontSize = Math.max(min, Math.min((ref * avail * share) / w, max)) + "px";
  };
  const fitAll = () => {
    fit(document.querySelector(".g-display"), 200, 0.9, 16, 420);
    fit(document.querySelector(".g-lede"), 100, 0.4, 12, 110);
  };
  fitAll();
  addEventListener("resize", fitAll, { passive: true });
  document.fonts && document.fonts.ready.then(fitAll);

  const ready = () => document.body.classList.add("g-ready");
  requestAnimationFrame(ready);
  document.fonts && document.fonts.ready.then(ready);

  const rises = document.querySelectorAll(".g-rise");
  if (reduce) rises.forEach((el) => el.classList.add("is-in"));
  else {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.15 });
    rises.forEach((el) => io.observe(el));
  }

  let lenis = null;
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis && window.gsap && !reduce) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.gLenis = lenis;
  const scrollTo = (target, opts) => {
    if (lenis) lenis.scrollTo(target, opts);
    else if (typeof target === "number") window.scrollTo({ top: target, behavior: reduce ? "auto" : "smooth" });
    else target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (a.id === "g-ct-open" || a.id === "g-ct-line" || id.length < 2) return;
    const el = document.querySelector(id);
    if (el) { e.preventDefault(); scrollTo(el, { offset: 0 }); }
  }));

  const lock = (on) => {
    if (lenis) on ? lenis.stop() : lenis.start();
    else root.style.overflow = on ? "hidden" : "";
  };

  // Scroll hint — flips to Up after scrolling past .6 of the screen, pressing goes to About or to the top in 1.1s
  const cue = document.getElementById("g-cue");
  if (cue) {
    let up = false;
    const update = () => {
      const now = scrollY > innerHeight * 0.6;
      if (now === up) return;
      up = now;
      cue.classList.toggle("is-up", up);
      cue.setAttribute("aria-label", up ? "Scroll to top" : "Scroll to About");
    };
    cue.addEventListener("click", () => scrollTo(up ? 0 : document.getElementById("intro") || innerHeight, { duration: 1.1 }));
    addEventListener("scroll", update, { passive: true });
    update();
  }

  // Modal — is-open two frames after opening (backdrop blur .75s · panel .55s), hidden .8s after closing
  const modal = document.getElementById("g-ct-modal");
  const pp = document.getElementById("g-pp-modal");
  const open = (m, e, keepLock) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    m._last = document.activeElement;
    m.classList.add("is-visible");
    m.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => requestAnimationFrame(() => m.classList.add("is-open")));
    if (!keepLock) lock(true);
    m.querySelector(".g-modal__panel").focus({ preventScroll: true });
  };
  const close = (m, keepLock) => {
    m.classList.remove("is-open");
    m.setAttribute("aria-hidden", "true");
    if (!keepLock) lock(false);
    if (m._last && m._last.focus) m._last.focus({ preventScroll: true });
    setTimeout(() => { if (!m.classList.contains("is-open")) m.classList.remove("is-visible"); }, 800);
  };
  if (modal) {
    const choose = document.getElementById("g-ct-choose"), head = document.getElementById("g-ct-head");
    const form = document.getElementById("g-ct-form"), done = document.getElementById("g-ct-done");
    const reset = () => { choose.hidden = false; head.hidden = true; form.hidden = true; form.reset(); done.hidden = true; done.classList.remove("is-in"); };
    const openCt = (e) => { reset(); open(modal, e); };
    document.getElementById("g-ct-open")?.addEventListener("click", openCt);
    document.getElementById("g-fab")?.addEventListener("click", openCt);
    document.getElementById("g-ct-mail").addEventListener("click", () => {
      choose.hidden = true; head.hidden = false; form.hidden = false;
      form.querySelector(".g-form__i").focus();
    });
    document.getElementById("g-ct-line").addEventListener("click", (e) => { e.preventDefault(); setTimeout(() => close(modal), 60); });
    modal.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) close(modal); });
    // Non-sending form — fakes sending by fitting the panel height in .6s and drawing a check mark
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector(".g-submit");
      btn.disabled = true;
      setTimeout(() => {
        const panel = modal.querySelector(".g-modal__panel"), start = panel.offsetHeight;
        head.hidden = true; form.hidden = true; done.hidden = false;
        const end = panel.offsetHeight;
        if (panel.animate && start !== end && !reduce) panel.animate([{ height: start + "px" }, { height: end + "px" }], { duration: 600, easing: "cubic-bezier(.4,0,.2,1)" });
        requestAnimationFrame(() => done.classList.add("is-in"));
        btn.disabled = false;
      }, 400);
    });
  }
  if (pp) {
    const openPp = (e) => open(pp, e, modal && modal.classList.contains("is-open"));
    document.getElementById("g-pp-open-ft")?.addEventListener("click", openPp);
    document.getElementById("g-pp-open-cf")?.addEventListener("click", openPp);
    pp.addEventListener("click", (e) => { if (e.target.closest("[data-pp-close]")) close(pp, modal && modal.classList.contains("is-open")); });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (pp && pp.classList.contains("is-open")) close(pp, modal && modal.classList.contains("is-open"));
    else if (modal && modal.classList.contains("is-open")) close(modal);
  });
})();
