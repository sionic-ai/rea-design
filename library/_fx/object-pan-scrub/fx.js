(() => {
  // Original ImgParallax: shifts the visible position of a photo filling its box from the top edge (50% 0%) to the bottom edge (50% 100%) — from when the box enters the bottom of the screen until it leaves at the top,
  // scrub 3 (follows late) · GSAP default curve. The taller the photo is than its cell, the more it drifts. img · video use object-position, anything else (placeholder panels) uses background-position.
  kfFx.register("object-pan-scrub", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = /^(IMG|VIDEO)$/.test(el.tagName);
    const key = media ? "objectPosition" : "backgroundPosition";
    const from = options.from || "50% 0%", to = options.to || "50% 100%";
    const tween = gsap.fromTo(el, { [key]: from }, {
      [key]: to,
      ease: kfFx.ease(options.ease || "power1.out", "power1.out"),
      scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: "top bottom", end: "bottom top", scrub: +(options.scrub ?? 3) },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(el, { clearProps: key });
    };
  });
})();
