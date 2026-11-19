// One report — heading entrance, wide photo zoom, two photo stages (shared OW.cinematic), wide photo flow
(() => {
  const { reduce, motion } = OW;
  const $ = (s, r = document) => r.querySelector(s);

  const start = () => {
    if (reduce) {
      document.querySelectorAll(".ar-cine").forEach((c) => OW.cinematic(c));
      return;
    }
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      // Heading: .06 pause, then the title words stand up tilted 5° inside a mask (.025 gap .75 back), and the partner copy lines follow .25 later (.1 gap) — matched to the measured hero change length of 1028ms
      const words = OW.splitWords($(".ar-hero__title")).words;
      const lines = OW.splitLines($(".ar-hero__by")).lines;
      gsap.set(words, motion.HEAD_FROM); gsap.set(lines, motion.TEXT_FROM);
      const go = () => { gsap.to(words, { ...motion.HEAD_TO, delay: 0.06 }); gsap.to(lines, { ...motion.TEXT_TO, delay: 0.31 }); };
      OW.ready ? go() : document.addEventListener("ow:ready", go, { once: true });

      // Wide photo: scales .85 → 1 (inner 1/.85 → 1) to fit the original screen, which is already nearly full at the hero (scrub .5)
      const box = $("[data-image-container]"), inner = $("[data-image-container-inner]");
      gsap.fromTo(box, { scale: 0.85 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".ar-image", start: "top bottom", end: "top top", scrub: 0.5 } });
      gsap.fromTo(inner, { scale: 1 / 0.85 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".ar-image", start: "top bottom", end: "top top", scrub: 0.5 } });

      document.querySelectorAll(".ar-cine").forEach((c) => OW.cinematic(c));

      // Wide photo flow: while the panel passes, the inner photo flows up (scrub .5)
      gsap.fromTo(".ar-parallax__in", { yPercent: -10 }, { yPercent: 10, ease: "none", scrollTrigger: { trigger: ".ar-parallax", start: "top bottom", end: "bottom top", scrub: 0.5 } });
    });
  };

  OW.boot(start);
})();
