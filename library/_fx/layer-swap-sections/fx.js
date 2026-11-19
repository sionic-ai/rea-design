(() => {
  // Sections received via watch turn on the panel whose data-key matches the section id when they pass a line of the screen (default 80% from top) — first panel if none match
  kfFx.register("layer-swap-sections", (el, { options }) => {
    const layers = [...el.querySelectorAll("[data-fx-part='layer']")];
    if (!layers.length) return;
    const show = (key) => { const hit = layers.find((l) => l.dataset.key === key) || layers[0]; layers.forEach((l) => l.classList.toggle("is-show", l === hit)); };
    show(layers.find((l) => l.classList.contains("is-show"))?.dataset.key);
    const min = +(options.min ?? 768);
    if (!options.watch || innerWidth < min) return () => layers.forEach((l) => l.classList.remove("is-show"));
    let secs = [];
    try { secs = [...document.querySelectorAll(options.watch)]; } catch { return; }
    const line = +(options.line ?? 80);
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && show(e.target.id)), { rootMargin: `-${line}% 0% -${100 - line}% 0%` });
    secs.forEach((s) => io.observe(s));
    return () => { io.disconnect(); layers.forEach((l) => l.classList.remove("is-show")); };
  });
})();
