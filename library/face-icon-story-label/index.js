// Home page — when the loader ends, plays the logo Lottie once (original mvAnimStart), brings in the statement one block at a time,
// Ties the bubble plate band to scroll (original WhatWeDoSegment: band travel = Distance the panel’s top edge has passed above the screen, clamped from 0 to the overflow width)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("ontouchstart" in document && "orientation" in window) document.documentElement.classList.add("is-touch-device");

  const start = () => document.querySelectorAll("[data-mv]").forEach((el) => window.nmLottie(el)?.play());
  if (document.documentElement.classList.contains("is-loading-finished")) start();
  else document.addEventListener("nm:ready", start, { once: true });

  // Declaration: when it comes within 200px above or below, add is-inview (once)
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-inview"); io.unobserve(e.target); }
  }), { rootMargin: "-200px 0px -200px 0px" });
  document.querySelectorAll("[data-statement-anim]").forEach((el) => (reduce ? el.classList.add("is-inview") : io.observe(el)));

  // Bubble panel horizontal band
  const segs = [...document.querySelectorAll("[data-seg]")].map((wrap) => ({
    wrap,
    slider: wrap.querySelector(".nm-seg__slider"),
    slide: wrap.querySelector(".nm-seg__slide"),
    contentW: 0,
  }));
  const update = () => segs.forEach((s) => {
    const slideW = s.slide.clientWidth;
    s.contentW = s.wrap.querySelector(".nm-seg__track").scrollWidth - slideW;
    s.wrap.style.setProperty("--slider-slide-width", slideW);
    s.wrap.style.setProperty("--slider-content-width", s.contentW);
    onScroll();
  });
  const onScroll = () => segs.forEach((s) => {
    const e = -Math.floor(s.wrap.getBoundingClientRect().top);
    const amount = e < 0 ? 0 : e > s.contentW ? s.contentW : e;
    s.wrap.style.setProperty("--slider-content-scroll-amount", amount);
  });
  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; onScroll(); });
  }, { passive: true });
  let t = 0;
  addEventListener("resize", () => { clearTimeout(t); t = setTimeout(update, 200); });
  update();
  document.fonts?.ready.then(update);
})();
