(() => {
  // Each group moves to the next slide with is-active every every seconds (previous gets is-prev). Runs only while the panel is on screen
  kfFx.register("drift-fade-cycle", (el, { options, reduce }) => {
    if (reduce) return;
    const stacks = [...el.querySelectorAll('[data-fx-part="stack"]')];
    if (!stacks.length && el.querySelector('[data-fx-part="item"]')) stacks.push(el);
    if (!stacks.length) return;
    const every = Math.max(0.5, +(options.every || 5));
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    if (options.lag != null) el.style.setProperty("--fx-lag", `${+options.lag}s`);
    if (options.shift != null) el.style.setProperty("--fx-shift", `${+options.shift}%`);
    const groups = stacks.map((s, i) => {
      s.style.setProperty("--fx-index", i);
      return { items: [...s.querySelectorAll('[data-fx-part="item"]')], cur: 0 };
    }).filter((g) => g.items.length);
    if (!groups.length) return;
    const mark = (g) => g.items.forEach((it, i) => {
      it.classList.toggle("is-active", i === g.cur);
      it.classList.toggle("is-prev", i === (g.cur + g.items.length - 1) % g.items.length);
    });
    let timer = 0;
    const tick = () => groups.forEach((g) => { g.cur = (g.cur + 1) % g.items.length; mark(g); });
    const play = () => { if (timer) return; groups.forEach(mark); timer = setInterval(tick, every * 1000); };
    const stop = () => { clearInterval(timer); timer = 0; };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? play() : stop()));
    io.observe(el);
    return () => {
      stop(); io.disconnect();
      groups.forEach((g) => g.items.forEach((it) => it.classList.remove("is-active", "is-prev")));
      stacks.forEach((s) => s.style.removeProperty("--fx-index"));
      ["--fx-dur", "--fx-lag", "--fx-shift"].forEach((v) => el.style.removeProperty(v));
    };
  });
})();
