// Careers — the photo strip flows left seamlessly (original Framer marquee strip)
(() => {
  if (!window.gsap) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-photo-strip]").forEach((strip) => {
    const row = strip.querySelector(".rc-strip__row");
    row.append(...[...row.children].map((n) => n.cloneNode(true)));
    if (!reduce) gsap.to(row, { xPercent: -50, duration: 60, ease: "none", repeat: -1 });
  });
})();
