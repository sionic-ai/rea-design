// Common to all pages — Lenis (1.2s · min(1, 1.001 − 2^(−10t))) tied to the GSAP ticker, menu panel open/close, text rise, photo parallax, the white header bar over the hero,
// Back-to-top button (including the floating ring button on detail pages), fold button. Strips · pinned panels · loaders · rings are attached by the motion part (_fx) via data-fx.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));
  const lenis = !reduce && window.Lenis ? new Lenis({ duration: 1.2, easing: ease, touchMultiplier: 2 }) : null;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (lenis) {
    lenis.on("scroll", () => window.ScrollTrigger && ScrollTrigger.update());
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const to = (target) => (lenis ? lenis.scrollTo(target, { offset: 0, duration: 1, easing: ease }) : (typeof target === "number" ? scrollTo({ top: target, behavior: "smooth" }) : document.querySelector(target)?.scrollIntoView({ behavior: "smooth" })));

  // ── Menu board: a gray panel opens and closes blurred over .5s power2.out, and body scroll stops while it is open
  const header = document.querySelector(".tb-header"), btn = document.querySelector(".tb-hamb"), nav = document.querySelector(".tb-nav");
  btn?.addEventListener("click", () => {
    const open = header.classList.contains("is-open");
    gsap.set(nav, { display: "block" });
    header.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(!open));
    document.body.style.overflow = open ? "" : "hidden";
    open ? lenis?.start() : lenis?.stop();
    gsap.to(nav, { opacity: open ? 0 : 1, duration: 0.5, ease: "power2.out", onComplete: () => gsap.set(nav, { display: open ? "none" : "block" }) });
  });

  // ── Over the Hero the header row wears a white skin (original top.js — past the #topslide spot it turns ink black)
  const until = document.querySelector("[data-white-until]");
  if (until && header) {
    const edge = () => until.getBoundingClientRect().top + scrollY;
    let at = edge();
    addEventListener("resize", () => (at = edge()));
    const check = () => header.classList.toggle("whiteme", scrollY < at);
    header.classList.add("whiteme");
    addEventListener("scroll", check, { passive: true });
    check();
  }

  // ── # links glide with Lenis over 1s (original link-scroll)
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href^='#']");
    if (!a) return;
    e.preventDefault();
    const id = a.getAttribute("href");
    if (id === "#" || id === "#top") to(0); else to(id);
  });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Text rise: when the top edge of a block reaches screen center, it stands up from 10px below and transparent over 1s (once)
    gsap.utils.toArray(".gfade").forEach((el) => {
      gsap.set(el, { opacity: 0, y: 10 });
      gsap.to(el, { opacity: 1, y: 0, duration: 1, scrollTrigger: { trigger: el, start: "top center", once: true } });
    });
    // Photo parallax: while a cell passes from the bottom of the screen to the top, the photo inside moves yPercent from start value → end value (default −10 → −30), scrub 1
    gsap.utils.toArray(".tb-para").forEach((box) => {
      const img = box.firstElementChild;
      gsap.fromTo(img, { yPercent: +(box.dataset.starty ?? -10) }, { yPercent: +(box.dataset.endy ?? -30), ease: "none", scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: 1 } });
    });
  });

  // ── Floating back-to-top ring (detail): only when scrolled past half the screen and the footer isn’t visible, the body gets -showFixBtn
  const fixBtn = document.querySelector(".tb-fixtop");
  const footer = document.querySelector(".tb-footer");
  if (fixBtn && footer) {
    const toggle = () => document.body.classList.toggle("-showFixBtn", scrollY > innerHeight / 2 && footer.getBoundingClientRect().top > innerHeight);
    addEventListener("scroll", toggle, { passive: true });
    toggle();
  }

  // ── Collapse (FAQ): pressing the head adds -open and max-height opens over .5s ease-out
  document.querySelectorAll(".tb-toggle-btn").forEach((b) => b.addEventListener("click", () => {
    const box = b.closest(".tb-toggle");
    const item = box.querySelector(".tb-toggle-item");
    const open = box.classList.toggle("-open");
    item.style.maxHeight = open ? `${item.scrollHeight}px` : "0px";
    b.setAttribute("aria-expanded", String(open));
  }));

  // ── Sequential photos (original animateImages): swaps the stacked sheets one by one every interval ms
  document.querySelectorAll("[data-frames]").forEach((box) => {
    const fs = [...box.children];
    if (!fs.length) return;
    let i = 0;
    fs[0].classList.add("is-on");
    if (reduce || fs.length < 2) return;
    setInterval(() => { fs[i].classList.remove("is-on"); i = (i + 1) % fs.length; fs[i].classList.add("is-on"); }, +box.dataset.frames || 400);
  });

  addEventListener("load", () => window.ScrollTrigger && ScrollTrigger.refresh());
})();
