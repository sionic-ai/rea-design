(() => {
  kfFx.register("bounce-thumb-pop", (el, { options, reduce, scroller }) => {
    const label = options.look === "label";
    const items = label ? [el] : [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const step = +(options.step ?? 0.2), delay = +(options.delay ?? (label ? 0.72 : 0)), after = +(options.after ?? 0.4);
    items.forEach((it, i) => {
      it.style.setProperty("--fx-d", `${delay + i * step}s`);
      it.querySelectorAll('[data-fx-part="after"]').forEach((a) => a.style.setProperty("--fx-d", `${delay + after + i * step}s`));
    });
    if (reduce) { el.classList.add("is-fx-in", "is-fx-still"); return () => el.classList.remove("is-fx-in", "is-fx-still"); }
    // Original: fires once when the top edge crosses the 25% line from the bottom of the screen (rootMargin 0 0 -25% 0)
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      el.classList.add("is-fx-in");
      io.disconnect();
    }), { root: scroller || null, rootMargin: options.margin || "0px 0px -25% 0px", threshold: 0 });
    io.observe(el);
    return () => {
      io.disconnect();
      el.classList.remove("is-fx-in");
      items.forEach((it) => { it.style.removeProperty("--fx-d"); it.querySelectorAll('[data-fx-part="after"]').forEach((a) => a.style.removeProperty("--fx-d")); });
    };
  });
})();
