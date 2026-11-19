// In the original each note has its own tilt (rotate property), so the twist while falling is applied only to the transform rotation (rotation) — once placed it returns to its own tilt
(() => {
  kfFx.register("drop-in", (el, { options, scroller }) => {
    gsap.registerPlugin(ScrollTrigger, CustomEase);
    const ease = CustomEase.create("fxDrop", "0.34,1.45,0.64,1"), gap = +(options.stagger || 0.12), mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      [...el.children].forEach((n, i) => gsap.from(n, { y: -60, scale: 1.25, autoAlpha: 0, rotation: i % 2 ? 14 : -14, duration: 0.7, ease, delay: i * gap, scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: options.start || "top 55%" } }));
    });
    return () => mm.revert();
  });
})();
