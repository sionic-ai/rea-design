(() => {
  // Once when text crosses the line at 20% from the screen bottom — the box behind the word fills upward from its bottom edge (clip-path), then the previously empty word letters turn on.
  kfFx.register("mark-box-rise", (el, { options, reduce }) => {
    const marks = el.querySelectorAll('[data-fx-part="mark"]');
    if (!marks.length) return;
    const set = (k, v) => v != null && el.style.setProperty(k, v);
    set("--fx-dur", options.dur != null ? `${+options.dur}s` : null);
    set("--fx-delay", options.delay != null ? `${+options.delay}s` : null);
    set("--fx-text-delay", options.text != null ? `${+options.text}s` : null);
    const step = +(options.step ?? 0);
    marks.forEach((m, i) => m.style.setProperty("--fx-i", String(i * step)));
    const on = () => el.classList.add("is-fx-in");
    if (reduce) { on(); return () => el.classList.remove("is-fx-in"); }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { on(); io.disconnect(); }
    }, { rootMargin: options.margin || "0px 0px -20% 0px" });
    io.observe(el);
    return () => { io.disconnect(); el.classList.remove("is-fx-in"); marks.forEach((m) => m.style.removeProperty("--fx-i")); };
  });
})();
