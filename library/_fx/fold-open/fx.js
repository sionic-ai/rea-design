(() => {
  kfFx.register("fold-open", (el, { options, scroller }) => {
    const face = el.firstElementChild;
    if (!face) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(face, { rotationX: +(options.from || -88) }, { rotationX: 0, ease: "none", scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: "top bottom", end: "bottom bottom", scrub: true } });
    });
    return () => mm.revert();
  });
})();
