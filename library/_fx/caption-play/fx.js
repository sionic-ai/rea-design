(() => {
  kfFx.register("caption-play", (el, { options, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const words = el.querySelectorAll('[data-fx-part="word"]'), knob = el.querySelector('[data-fx-part="knob"]'), mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: options.start || "top 50%" } });
      if (words.length) tl.fromTo(words, { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: +(options.gap || 0.28) });
      if (knob) tl.fromTo(knob, { left: "0%" }, { left: "100%", duration: +(options.length || 32), ease: "none" }, 0);
    });
    return () => mm.revert();
  });
})();
