(() => {
  // Elements entering the band minus margin px at the bottom of the screen get is-seen, and inner art (data-fx-part="media", or the element if none) turns on at .2s.
  // The order is the batch number — items that came in together are 1, 2, 3… and it returns to 1 each time a scroll happens (exactly like the original IntersectionObserver).
  // Once on, it never hides again, and is-in is attached only while inside the strip. Number × 80ms + 1s later is-done
  let order = 1;
  addEventListener("scroll", () => (order = 1), { passive: true });
  const watchers = new Map();
  const watcher = (margin) => {
    if (!watchers.has(margin)) {
      watchers.set(margin, new IntersectionObserver((list) => list.forEach((e) => {
        const el = e.target;
        if (!e.isIntersecting) { el.classList.remove("is-in"); return; }
        el.classList.add("is-seen", "is-in");
        el.style.setProperty("--fx-i", order);
        clearTimeout(el._fxBsf);
        el._fxBsf = setTimeout(() => el.classList.add("is-done"), order * 80 + 1000);
        order++;
      }), { rootMargin: `0px 0px ${-margin}px 0px` }));
    }
    return watchers.get(margin);
  };
  kfFx.register("batch-stagger-fade", (el, { options, reduce }) => {
    if (reduce) { el.classList.add("is-seen", "is-done"); return () => el.classList.remove("is-seen", "is-done"); }
    const step = +(options.step ?? 0.06), dur = +(options.dur ?? 0.2);
    el.style.setProperty("--fx-step", `${step}s`);
    el.style.setProperty("--fx-dur", `${dur}s`);
    if (options.ease) el.style.setProperty("--fx-ease", String(options.ease).includes(",") ? `cubic-bezier(${options.ease})` : options.ease);
    const io = watcher(+(options.margin ?? 170));
    io.observe(el);
    return () => { io.unobserve(el); clearTimeout(el._fxBsf); el.classList.remove("is-seen", "is-in", "is-done"); ["--fx-i", "--fx-step", "--fx-dur", "--fx-ease"].forEach((v) => el.style.removeProperty(v)); };
  });
})();
