// The original checks on each scroll whether the window bottom has passed the element top, and once [data-animation="after"] is added — is-fx-in is added at the same threshold (top bottom)
(() => {
  kfFx.register("fly-in-bob", (el, { options, reduce, scroller }) => {
    if (reduce || typeof ScrollTrigger === "undefined") {
      el.classList.add("is-fx-in");
      return () => el.classList.remove("is-fx-in");
    }
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top bottom", once: true, onEnter: () => el.classList.add("is-fx-in") });
    return () => { st.kill(); el.classList.remove("is-fx-in"); };
  });
})();
