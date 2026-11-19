(() => {
  kfFx.register("circle-shrink-reveal", (el, { options, reduce, scroller }) => {
    if (reduce) { el.classList.add("is-fx-revealed"); return () => el.classList.remove("is-fx-revealed"); }
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const st = ScrollTrigger.create({ trigger: el, scroller: scroller || window, start: options.start || "top 85%", once: true, onEnter: () => el.classList.add("is-fx-revealed") });
      return () => st.kill();
    });
    return () => { mm.revert(); el.classList.remove("is-fx-revealed"); };
  });
})();
