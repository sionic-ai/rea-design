(() => {
  // Hand-drawn ornament beside the heading plays once when it crosses the 20% line from the bottom of the screen — hidden small, then pops in bouncing 1→1.25→.9→1.1→1
  kfFx.register("bounce-scale-in", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    // side: right — triggers when crossing a vertical line inset by margin from the right edge of the screen on a horizontally flowing stage (Brand base, 50~90% line)
    const margin = options.margin ?? "-20%";
    if (options.scale != null) el.style.setProperty("--fx-from", options.scale);
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    el.classList.add("fx-bsi-wait");
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      el.classList.add("fx-bsi-in");
      io.disconnect();
    }), { root: scroller || null, rootMargin: options.side === "right" ? `0% ${margin} 0% 0%` : `0% 0% ${margin} 0%`, threshold: 0 });
    io.observe(el);
    return () => { io.disconnect(); el.classList.remove("fx-bsi-wait", "fx-bsi-in"); el.style.removeProperty("--fx-from"); el.style.removeProperty("--fx-dur"); };
  });
})();
