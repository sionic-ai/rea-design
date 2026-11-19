/* Recruit: big photo passes slightly late, following the scroll */
(() => {
  const el = document.querySelector(".tw-parallax");
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    gsap.fromTo(el, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
  });
})();
