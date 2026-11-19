(() => {
  kfFx.register("flip-note-loop", (el, { options, reduce }) => {
    if (reduce) return;
    // If the gap is 0 the panel flickers nonstop, so fall back to a default with ||
    const every = (+options.every || 4) * 1000, delay = +(options.delay ?? 0) * 1000;
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    if (options.tint != null) el.style.setProperty("--fx-tint-alpha", +options.tint);
    let tick = 0;
    const wait = setTimeout(() => { tick = setInterval(() => el.classList.toggle("is-flipped"), every); }, delay);
    return () => {
      clearTimeout(wait);
      clearInterval(tick);
      el.classList.remove("is-flipped");
      el.style.removeProperty("--fx-dur");
      el.style.removeProperty("--fx-tint-alpha");
    };
  });
})();
