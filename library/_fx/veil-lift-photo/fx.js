(() => {
  // Original euphoria (js-onscreen): when a photo cell enters the screen, a background-color cover over the cell lifts up in 1.5s (height 100% → 0),
  // Photo rises from 100px below with a .2s delay over 1.5s (easeOutCubic). Leaving the screen resets it, and it repeats every time it re-enters
  kfFx.register("veil-lift-photo", (el, { options, reduce, scroller }) => {
    const set = (k, v) => v != null && el.style.setProperty(k, v);
    set("--fx-rise", options.rise != null ? `${+options.rise}px` : null);
    set("--fx-dur", options.dur != null ? `${+options.dur}s` : null);
    set("--fx-delay", options.delay != null ? `${+options.delay}s` : null);
    // veil-delay·ease — STUDIO photo veil (Brand): lifts after a .2s delay over 1.2s with cubic-bezier(.19,1,.22,1)
    set("--fx-veil-delay", options["veil-delay"] != null ? `${+options["veil-delay"]}s` : null);
    set("--fx-ttc", options.ease ? (/^[\d.,\s-]+$/.test(options.ease) ? `cubic-bezier(${options.ease})` : options.ease) : null);
    const vars = ["--fx-rise", "--fx-dur", "--fx-delay", "--fx-veil-delay", "--fx-ttc"];
    const off = () => { io?.disconnect(); el.classList.remove("is-fx-ready", "is-fx-in"); vars.forEach((v) => el.style.removeProperty(v)); };
    let io = null;
    if (reduce) return off;
    el.classList.add("is-fx-ready");
    const once = options.once === "true";
    io = new IntersectionObserver(([e]) => {
      el.classList.toggle("is-fx-in", e.isIntersecting || (once && el.classList.contains("is-fx-in")));
      if (once && e.isIntersecting) io.disconnect();
    }, { root: scroller || null });
    io.observe(el);
    return off;
  });
})();
