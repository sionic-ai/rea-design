// First page: pins the big text block on screen throughout the photo strip range (original pinSpacing:false)
(() => {
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    ScrollTrigger.create({ trigger: ".kn-mv", start: "top top", end: "bottom bottom", pin: ".kn-mv__pin", pinSpacing: false, anticipatePin: 1 });
  });
})();
