(() => {
  // Distance and tilt from the original per direction — +10° when lifted from the right, +5° from below
  const FROM = {
    down: [0, 1, 5], up: [0, -1, -5], left: [-1, 0, -10], right: [1, 0, 10],
    "down-right": [1, 1, 10], "down-left": [-1, 1, -10], "up-right": [1, -1, 10], "up-left": [-1, -1, -10],
  };
  kfFx.register("step-enter", (el, { options, reduce, scroller }) => {
    const [dx, dy, rot] = FROM[options.from] || FROM.down;
    const dist = +(options.dist ?? 40);
    const set = (k, v) => el.style.setProperty(k, v);
    set("--fx-x", `${dx * dist}px`);
    set("--fx-y", `${dy * dist}px`);
    set("--fx-rotate", `${options.rotate != null ? +options.rotate : rot}deg`);
    if (options.dur != null) set("--fx-dur", `${+options.dur}s`);
    if (options.steps != null) set("--fx-steps", String(+options.steps || 5));
    const clear = () => ["--fx-x", "--fx-y", "--fx-rotate", "--fx-dur", "--fx-steps"].forEach((k) => el.style.removeProperty(k));
    if (reduce) { el.classList.add("is-in"); return () => { el.classList.remove("is-in"); clear(); }; }
    // look: swing — like the Brand character, one step each second: it comes in from outside (ox·oy) by a % of its own size, tilting alternately rot±swing, and grows s0→1. The first step is not visible
    if (options.look === "swing") {
      const n = +options.steps || 4, each = +(options.each ?? 0.4), swing = +(options.swing ?? 15), rot = +(options.rot ?? 0);
      const ox = +(options.ox ?? 0), oy = +(options.oy ?? 0), s0 = +(options.s0 ?? 1);
      let step = -1, iv = 0, wait = 0;
      const paint = () => {
        const i = Math.max(0, step) / n;
        const r = step < 0 ? rot + swing : step >= n ? rot : step % 2 === 0 ? rot + swing : rot - swing;
        el.style.transform = `translate(${ox * (1 - i)}%, ${oy * (1 - i)}%) rotate(${r}deg) scale(${s0 + i * (1 - s0)})`;
        el.style.opacity = step > 0 ? 1 : 0;
      };
      const run = () => {
        wait = setTimeout(() => {
          step = 0;
          paint();
          iv = setInterval(() => {
            step++;
            paint();
            if (step >= n) { clearInterval(iv); el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); }
          }, each * 1000);
        }, +(options.delay ?? 0) * 1000);
      };
      paint();
      const io = options.on === "load" ? null : new IntersectionObserver((list) => {
        if (!list.some((e) => e.isIntersecting)) return;
        io.disconnect();
        run();
      }, { root: scroller && scroller !== window ? scroller : null, threshold: +(options.at ?? 0.1) });
      io ? io.observe(el) : run();
      return () => { io?.disconnect(); clearTimeout(wait); clearInterval(iv); el.style.removeProperty("transform"); el.style.removeProperty("opacity"); clear(); };
    }
    // Pieces moving inside a panel also catch the moment they become visible, so judge against the window (or the inner scroll panel)
    const io = new IntersectionObserver((list) => {
      if (!list.some((e) => e.isIntersecting)) return;
      el.classList.add("is-in");
      io.disconnect();
    }, { root: scroller && scroller !== window ? scroller : null, threshold: +(options.at ?? 0.1) });
    io.observe(el);
    return () => { io.disconnect(); el.classList.remove("is-in"); clear(); };
  });
})();
