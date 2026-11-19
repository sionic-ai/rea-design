// The spread itself is a CSS transition (left, top, bottom, transform) — here only a single display flag is set the moment it enters
(() => {
  kfFx.register("center-burst-in", (el, { options, reduce, scroller }) => {
    if (!el.querySelector("[data-fx-part=item]")) return;
    if (reduce) { el.classList.add("is-burst"); return () => el.classList.remove("is-burst"); }
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({ trigger: el, start: options.start || "top 90%", once: true, scroller, onEnter: () => el.classList.add("is-burst") });
    return () => { st.kill(); el.classList.remove("is-burst"); };
  });
})();
