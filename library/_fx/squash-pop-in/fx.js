(() => {
  kfFx.register("squash-pop-in", (el, { options, reduce, scroller }) => {
    if (options.delay != null) el.style.setProperty("--fx-delay", `${+options.delay}s`);
    if (reduce) { el.classList.add("is-fx-in", "is-fx-still"); return () => { el.classList.remove("is-fx-in", "is-fx-still"); el.style.removeProperty("--fx-delay"); }; }
    // Fires once when it enters the center band of the screen (-50% top and bottom) — original js-inview50
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      el.classList.add("is-fx-in");
      io.disconnect();
    }), { root: scroller || null, rootMargin: options.margin || "-50% 0px" });
    io.observe(el);
    return () => { io.disconnect(); el.classList.remove("is-fx-in"); el.style.removeProperty("--fx-delay"); };
  });
})();
