// Original theme turns on once when even one pixel enters the screen (rootMargin 0) — it does not rewind when scrolling back up
(() => {
  kfFx.register("zoom-fade-in", (el, { options, scroller }) => {
    // margin is a px number, or a ratio of screen height (-10% — turns on when the section header reaches 90% of the screen)
    const m = String(options.margin ?? 0).trim(), margin = m.endsWith("%") ? m : `${+m}px`;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      el.classList.add("is-in");
      io.disconnect();
    }, { root: scroller || null, rootMargin: `0px 0px ${margin} 0px` });
    io.observe(el);
    return () => { io.disconnect(); el.classList.remove("is-in"); };
  });
})();
