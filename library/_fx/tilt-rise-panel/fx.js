// A color panel waiting tilted down stands up and rises as soon as it enters the screen — it hides again when it leaves (Brand creative .case-col)
(() => {
  kfFx.register("tilt-rise-panel", (el, { options, reduce, scroller }) => {
    if (reduce || !("IntersectionObserver" in window)) { el.classList.add("is-fx-in"); return () => el.classList.remove("is-fx-in"); }
    const once = options.once === "true";
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (en.isIntersecting) { el.classList.add("is-fx-in"); if (once) io.disconnect(); }
      else if (!once) el.classList.remove("is-fx-in");
    }), { root: scroller || null, threshold: +(options.threshold ?? 0.15) });
    io.observe(el);
    return () => { io.disconnect(); el.classList.remove("is-fx-in"); };
  });
})();
