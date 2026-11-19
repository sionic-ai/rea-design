// When the image (bird·decoration) touches the 60% line of the screen, once — it settles in from 6rem right at .8x over 1.2s easeOutCubic,
// A mask spreading from top to bottom (mask-size 100% 0 → 300%) clears over 5s (brand site c-effect-hato). Values via css variables, start line via the start option.
(() => {
  kfFx.register("perch-mask-in", (el, { options, reduce, scroller }) => {
    if (reduce || !window.ScrollTrigger) { el.classList.add("is-fx-in"); return () => el.classList.remove("is-fx-in"); }
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({ trigger: el, scroller: scroller || undefined, start: options.start || "top 60%", once: true, onEnter: () => el.classList.add("is-fx-in") });
    return () => { st.kill(); el.classList.remove("is-fx-in"); };
  });
})();
