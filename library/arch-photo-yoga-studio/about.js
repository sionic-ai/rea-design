// About: while the dark circle passes across the screen it floats up with yPercent 0→-20 (scrub 1)
(() => {
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-concept-circle-wrap]").forEach((wrap) => {
      const c = wrap.querySelector("[data-concept-circle]");
      gsap.fromTo(c, { yPercent: 0 }, {
        yPercent: -20, ease: "none",
        scrollTrigger: { trigger: wrap, start: "top bottom", end: "bottom top", scrub: 1 },
      });
    });
  });
})();
