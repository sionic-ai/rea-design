// Reveals from the top by how far the top edge of the measured box has passed the screen center (at) — progress = (screen height × at − box top) ÷ box height.
// Where a long graphic like a road or line gets drawn as far as the scroll. The revealed end melts away blurry by soft.
(() => {
  kfFx.register("mask-down-scrub", (el, { options, reduce, scroller }) => {
    const box = options.on === "parent" && el.parentElement ? el.parentElement : el;
    if (options.soft != null) el.style.setProperty("--fx-soft", `${+options.soft}px`);
    if (reduce) {
      el.style.setProperty("--fx-progress", "100%");
      return () => { el.style.removeProperty("--fx-progress"); el.style.removeProperty("--fx-soft"); };
    }
    const at = +(options.at ?? 0.5);
    const target = scroller || window;
    const update = () => {
      const r = box.getBoundingClientRect();
      const top = scroller ? scroller.getBoundingClientRect().top : 0;
      const vh = scroller ? scroller.clientHeight : innerHeight;
      const p = r.height ? Math.min(1, Math.max(0, (vh * at - (r.top - top)) / r.height)) : 0;
      el.style.setProperty("--fx-progress", `${p * 100}%`);
    };
    target.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    const ro = new ResizeObserver(update);
    ro.observe(box);
    update();
    return () => {
      target.removeEventListener("scroll", update);
      removeEventListener("resize", update);
      ro.disconnect();
      el.style.removeProperty("--fx-progress");
      el.style.removeProperty("--fx-soft");
    };
  });
})();
