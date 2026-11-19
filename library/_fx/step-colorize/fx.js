(() => {
  // In the original, when a section overlaps the screen even slightly, every i × 700ms the gray class on the i-th text and the grayscale class on the photo are removed — only once
  kfFx.register("step-colorize", (el, { options, reduce, scroller }) => {
    const parts = [...el.querySelectorAll('[data-fx-part="text"], [data-fx-part="photo"]')];
    if (!parts.length) return;
    const gap = +(options.gap ?? 0.7) * 1000;
    if (options.dur != null) el.style.setProperty("--fx-dur", +options.dur + "s");
    const steps = parts.map((p, i) => +(p.dataset.step ?? i + 1));
    el.classList.add("is-fx-armed");
    const timers = [];
    const light = () => {
      parts.forEach((p, i) => {
        if (reduce) { p.classList.add("is-fx-lit"); return; }
        timers.push(setTimeout(() => p.classList.add("is-fx-lit"), steps[i] * gap));
      });
    };
    let io = null;
    if (reduce) light();
    else {
      io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); light(); } }, { root: scroller || null });
      io.observe(el);
    }
    return () => {
      io?.disconnect();
      timers.forEach(clearTimeout);
      el.classList.remove("is-fx-armed");
      el.style.removeProperty("--fx-dur");
      parts.forEach((p) => p.classList.remove("is-fx-lit"));
    };
  });
})();
