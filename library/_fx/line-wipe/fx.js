(() => {
  kfFx.register("line-wipe", (el, { options, scroller }) => {
    if (!el.children.length) return;
    gsap.registerPlugin(ScrollTrigger);
    const steps = +(options.steps || 0), mm = gsap.matchMedia();
    // on: with load, it plays once right on attach without waiting for scroll (Brand hero two-line title 2s ease, .3s offset)
    const load = options.on === "load";
    const ease = steps ? `steps(${steps})` : options.ease ? kfFx.ease(options.ease, "power1.inOut") : "power1.inOut";
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(el.children, { clipPath: "inset(0 100% 0 0)" }, {
        clipPath: "inset(0 0% 0 0)", duration: +(options.duration || (steps ? 1.1 : 0.7)), stagger: +(options.stagger || (steps ? 0.35 : 0.22)),
        ease, delay: +(options.delay || 0), ...(!load && { scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: options.start || "top 55%" } }),
      });
    });
    return () => mm.revert();
  });
})();
