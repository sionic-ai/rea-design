(() => {
  // The original hangs both sticky top and bottom on every tab — past tabs stick to the top row, upcoming tabs to the bottom row, and only the side position shifts by the sum of the earlier tab widths
  kfFx.register("folder-tab-dock", (el, { options }) => {
    const tabs = [...el.children].filter((n) => n.matches('[data-fx-part="tab"]'));
    if (!tabs.length) return;
    const overlap = +(options.overlap ?? 1);
    if (options.top != null) el.style.setProperty("--fx-top", `${+options.top}px`);
    const place = () => {
      let x = 0;
      for (const t of tabs) {
        t.style.setProperty("--fx-x", `${x}px`);
        x += t.offsetWidth - overlap;
      }
    };
    place();
    const ro = new ResizeObserver(place);
    tabs.forEach((t) => ro.observe(t));
    return () => {
      ro.disconnect();
      tabs.forEach((t) => t.style.removeProperty("--fx-x"));
      el.style.removeProperty("--fx-top");
    };
  });
})();
