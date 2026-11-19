// About: each collage photo scroll-parallaxes at a different speed — smaller photos faster (±12% to ±28% shift)
(() => {
  if (window.DS.reduced) return;
  document.querySelectorAll(".ab-ph").forEach((el, i) => {
    const k = el.classList.contains("w20") || el.classList.contains("w24") ? 28 : el.classList.contains("w60") ? 0 : 12 + (i % 3) * 4;
    if (!k) return;
    gsap.fromTo(el, { yPercent: k }, { yPercent: -k, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
  });
})();
