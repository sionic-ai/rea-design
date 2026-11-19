// Career info: the header photo descends slower than the scroll (original parallaxBgEffect · scrub · ease none)
(() => {
  const { gsap, reduce } = window.MK;
  const img = document.querySelector("[data-parallax]");
  if (!img || reduce) return;
  gsap.to(img, { yPercent: 12, ease: "none", scrollTrigger: { trigger: ".career-hero", start: "top top", end: "bottom top", scrub: true } });
})();
