// Floats and ripples the blobs only while visible — the original adds and removes an inview class on each entry and exit, and plays and pauses video too
(() => {
  kfFx.register("grad-blob-breathe", (el, { options, reduce, scroller }) => {
    if (reduce) { el.classList.add("fx-in"); return () => el.classList.remove("fx-in"); }
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    const margin = options.margin ?? "0px";
    const io = new IntersectionObserver(([e]) => el.classList.toggle("fx-in", e.isIntersecting), { root: scroller || null, rootMargin: margin });
    io.observe(el);
    return () => { io.disconnect(); el.classList.remove("fx-in"); };
  });
})();
