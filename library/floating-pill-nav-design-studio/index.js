// Only the home page loads the original Framer ‹Smooth Scroll› part (Lenis 1.0.42 · intensity 10 → duration 1, the rest Lenis defaults) — other sections use native window scroll
(() => {
  if (!window.Lenis || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const lenis = new Lenis({ duration: 1 });
  // The original snaps straight to the top as soon as it attaches
  lenis.scrollTo(0, { immediate: true });
  if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
  if (window.gsap) { gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
  else { const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
})();
