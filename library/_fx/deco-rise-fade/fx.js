(() => {
  kfFx.register("deco-rise-fade", (el, { options, reduce, scroller }) => {
    if (reduce) {
      el.classList.add("is-visible");
      return () => el.classList.remove("is-visible");
    }
    gsap.registerPlugin(ScrollTrigger);
    const scope = (options.scope && el.closest(options.scope)) || el.closest("section") || el.parentElement;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { y: 0 }, {
        y: +(options.to ?? -300),
        ease: "none",
        scrollTrigger: { scroller, trigger: scope, start: options.start || "top 90%", end: options.end || "bottom -100%", scrub: true },
      });
      ScrollTrigger.create({ scroller, trigger: el, start: "top 90%", once: true, onEnter: () => el.classList.add("is-visible") });
    });
    return () => {
      ctx.revert();
      el.classList.remove("is-visible");
    };
  });
})();
