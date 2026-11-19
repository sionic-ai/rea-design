(() => {
  // When it enters the screen band (from outside the top band% to inside the bottom band%), add is-fx-in so css opens a circular mask from 0 to 100%
  kfFx.register("circle-mask-reveal", (el, { options, reduce, scroller }) => {
    const set = (k, v) => v != null && el.style.setProperty(k, v);
    set("--fx-dur", options.dur != null ? `${+options.dur}s` : null);
    set("--fx-delay", options.delay != null ? `${+options.delay}s` : null);
    set("--fx-ease", options.ease || null);
    const clear = () => { el.classList.remove("is-fx-in"); ["--fx-dur", "--fx-delay", "--fx-ease"].forEach((k) => el.style.removeProperty(k)); };
    if (reduce) { el.classList.add("is-fx-in"); return clear; }
    const band = +(options.band ?? 33), loop = options.loop === "on";
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { el.classList.add("is-fx-in"); if (!loop) io.disconnect(); }
      else if (loop) el.classList.remove("is-fx-in");
    }), { root: scroller || null, rootMargin: `${band}% 0% -${band}% 0%`, threshold: 0 });
    io.observe(el);
    return () => { io.disconnect(); clear(); };
  });
})();
