(() => {
  // Original shy: once the panel (.stage) is 30% visible, add is-show once — each cell settles into place over 1.2s, delayed by --i × 130ms
  kfFx.register("tile-fly-gather", (el, { options, reduce, scroller }) => {
    const tiles = () => [...el.querySelectorAll('[data-fx-part="tile"]')];
    const own = [];
    // Cells with order given via css (--fx-i) are left alone — so a collage whose order varies by width (original phone order) can be changed with media queries
    tiles().forEach((t, n) => {
      if (getComputedStyle(t).getPropertyValue("--fx-i").trim()) return;
      t.style.setProperty("--fx-i", t.dataset.i ?? n + 1);
      own.push(t);
    });
    const vars = {
      "--fx-dur": options.dur != null ? `${+options.dur}s` : null,
      "--fx-each": options.each != null ? `${+options.each}s` : null,
      "--fx-ease": options.ease || null,
      "--fx-dist": options.dist != null ? `${+options.dist}%` : null,
    };
    for (const [k, v] of Object.entries(vars)) if (v != null) el.style.setProperty(k, v);
    let io = null;
    const off = () => {
      io?.disconnect();
      el.classList.remove("is-fx-ready", "is-fx-in");
      Object.keys(vars).forEach((k) => el.style.removeProperty(k));
      own.forEach((t) => t.style.removeProperty("--fx-i"));
    };
    if (reduce || !tiles().length) return off;
    el.classList.add("is-fx-ready");
    const th = +(options.threshold ?? 0.3);
    io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting && e.boundingClientRect.top > 0) return;
      el.classList.add("is-fx-in");
      io.disconnect();
    }, { root: scroller || null, threshold: th });
    io.observe(el);
    return off;
  });
})();
