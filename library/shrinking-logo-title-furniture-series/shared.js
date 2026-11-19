// Page frame — smooth scroll (original’s own scroll ease .1 → Lenis lerp .1) · header bar state · phone menu · jump links · scroll lock during the hero curtain · photo reveal · wordmark width fitting · photo parallax.
(() => {
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  scrollTo(0, 0);

  // Wordmark — measure the text width and give the font size that exactly fits the cell width (the original is a cell-width SVG)
  const marks = [
    [".px-hero__mark", () => document.querySelector(".px-hero__ttl")?.clientWidth],
    [".px-load .px-mark", () => document.querySelector(".px-hero__ttl")?.clientWidth],
    [".px-foot__mark", () => document.querySelector(".px-foot__body")?.clientWidth - 2 * parseFloat(getComputedStyle(document.querySelector(".px-foot__body")).paddingLeft)],
    [".px-head__logo", () => Math.min(227.66, document.querySelector(".px-head__title")?.clientWidth || 217)],
  ];
  const fit = () => {
    for (const [sel, width] of marks) {
      const el = document.querySelector(sel);
      const w = width();
      if (!el || !w) continue;
      el.style.fontSize = "100px";
      const r = document.createRange();
      r.selectNodeContents(el);
      const tw = r.getBoundingClientRect().width;
      if (tw) el.style.fontSize = `${(100 * w) / tw}px`;
    }
  };
  fit();
  document.fonts?.ready.then(() => { fit(); window.ScrollTrigger?.refresh(); });
  addEventListener("resize", fit);

  // Smooth scroll — same damping as the original Brand scroll (ease .1)
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    window.pxLenis = lenis;
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Header row — past 50px of scroll the circle shrinks, and past the screen height the header hides upward when scrolling down
  let last = 0;
  const state = () => {
    const y = scrollY;
    html.classList.toggle("is-scrolled", y > 50);
    html.classList.toggle("is-menu-hide", y > innerHeight);
    if (Math.abs(y - last) > 1) html.dataset.scrollDir = y > last ? "down" : "up";
    last = y;
  };
  addEventListener("scroll", state, { passive: true });
  state();

  // Anchor links: the original rolls with power2.inOut over 1s (header logo) and 1.5s (to top)
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const go = (target, dur) => {
    if (lenis) lenis.scrollTo(target, { duration: dur, easing: ease });
    else (typeof target === "number" ? scrollTo({ top: target }) : target.scrollIntoView());
  };
  document.querySelectorAll("[data-scroll-top]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); go(0, a.closest(".px-foot") ? 1.5 : 1); }));
  // The original header menu is a pressable li, not a link — the copy takes the same form (role=link, also works with Enter·Space)
  document.querySelectorAll("[data-scroll-to]").forEach((a) => {
    const jump = (e) => {
      const t = document.querySelector(a.dataset.scrollTo || a.getAttribute("href"));
      if (!t) return;
      e.preventDefault();
      setMenu(false);
      go(t, 1);
    };
    a.addEventListener("click", jump);
    if (a.tagName !== "A") a.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") jump(e); });
  });

  // Phone · tablet menu
  const btn = document.querySelector("[data-menu-btn]"), panel = document.getElementById("px-menu-panel");
  function setMenu(open) {
    if (!btn) return;
    html.classList.toggle("is-menu-open", open);
    btn.setAttribute("aria-expanded", String(open));
    panel?.setAttribute("aria-hidden", String(!open));
    if (lenis) open ? lenis.stop() : lenis.start();
  }
  btn?.addEventListener("click", () => setMenu(!html.classList.contains("is-menu-open")));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && html.classList.contains("is-menu-open")) setMenu(false); });

  // Lock scrolling until the hero curtain lifts (original html.--is-loading)
  const loader = document.querySelector(".px-load");
  if (loader && !reduce) {
    html.classList.add("is-loading");
    lenis?.stop();
    loader.addEventListener("fx:done", () => { html.classList.remove("is-loading"); lenis?.start(); }, { once: true });
  }

  // Photo — turns on over 1s when it enters the screen (opacity transition of the original lazy loading)
  // The original starts lazy loading after the curtain lifts (loading:loaded), so the first photo also turns on then
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-loaded"); io.unobserve(e.target); } }));
  const lazy = () => document.querySelectorAll(".px-lazy").forEach((el) => io.observe(el));
  if (loader && !reduce) loader.addEventListener("fx:done", lazy, { once: true });
  else lazy();

  // Parallax — shifts the photo down by the original --p1 (0→1) × --parallax. The first photo runs from the very top until the cell’s bottom edge touches the screen top, the footer photo from when the footer touches the screen bottom to the end
  if (window.ScrollTrigger && !reduce) {
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll("[data-parallax]").forEach((el) => {
      const dist = +el.dataset.parallax;
      const foot = el.dataset.parallaxFrom === "footer";
      const trigger = foot ? el.closest(".px-foot") : el.parentElement;
      gsap.fromTo(el, { y: 0 }, { y: dist, ease: "none", scrollTrigger: { trigger, start: foot ? "top bottom" : 0, end: foot ? "bottom bottom" : "bottom top", scrub: true } });
    });
  }
})();
