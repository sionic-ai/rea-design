/* About — client name band flows endlessly (one set width over 35s, no pause) */
(() => {
  const run = document.querySelector(".rx-marquee__run");
  if (!run || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  gsap.to(run, { xPercent: -50, duration: 35, ease: "none", repeat: -1 });
})();
