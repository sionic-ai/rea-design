// Attach the sub panel to the right end of the column — column width differs per skin and screen, so re-measure on attach and on resize (--fx-left).
// The plate’s top margin is the option top (px) or the plate’s data-top, otherwise matched to the height of the line that opened the plate.
(() => {
  kfFx.register("side-flyout-nav", (el, { options }) => {
    const panels = () => [...el.querySelectorAll('[data-fx-part="panel"]')];
    const set = () => {
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      el.style.setProperty("--fx-left", `${options.left != null ? +options.left : Math.round(r.right)}px`);
      panels().forEach((p) => {
        const top = p.dataset.top ?? options.top;
        if (top != null) { p.style.setProperty("--fx-top", `${+top}px`); return; }
        const li = p.closest("li");
        if (li) p.style.setProperty("--fx-top", `${Math.round(li.getBoundingClientRect().top)}px`);
      });
    };
    const ro = new ResizeObserver(set);
    ro.observe(el);
    addEventListener("resize", set);
    set();
    return () => { ro.disconnect(); removeEventListener("resize", set); el.style.removeProperty("--fx-left"); panels().forEach((p) => p.style.removeProperty("--fx-top")); };
  });
})();
