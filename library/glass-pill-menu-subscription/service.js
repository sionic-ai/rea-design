// How it works — as in the original, only this page scrolls smoothly with Lenis (1.3.8, defaults). Photo covering is handled by _fx/step-cover-swap
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !window.Lenis) return;
  const lenis = new Lenis();
  window.site.lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
})();
