(() => {
  // Original brand .mediaMask(animateCssVariable): while the section stays pinned to the screen and +200% scrolls by, progress is fed into --fx-progress,
  // The circle covering the photo opens from radius 16vmin to 80vmin, the center background-color hole (diameter 16vmin) shrinks to 0 within the first 1/3 of progress so the ring becomes a disc, and
  // The color screen lifts from .75 to 0. Once fully open, is-done is set.
  kfFx.register("ring-mask-scrub", (el, { options, reduce, scroller }) => {
    if (!window.gsap || !window.ScrollTrigger) return;
    const put = (p) => { el.style.setProperty("--fx-progress", String(p)); el.classList.toggle("is-done", p >= 1); };
    if (reduce) { put(1); return () => { el.style.removeProperty("--fx-progress"); el.classList.remove("is-done"); }; }
    const pin = options.pin !== "false";
    const st = ScrollTrigger.create({
      scroller, trigger: el, start: options.start || "top top", end: options.end || "+=200%", scrub: true,
      ...(pin ? { pin: true, pinSpacing: true } : {}), invalidateOnRefresh: true,
      onUpdate: (s) => put(s.progress), onRefresh: (s) => put(s.progress),
    });
    put(st.progress);
    return () => { st.kill(true); el.style.removeProperty("--fx-progress"); el.classList.remove("is-done"); };
  });
})();
