(() => {
  // Original shy(inview): ‹Scroll > Cell top − window + window/5 — turns on once when a cell’s top edge crosses the 80% line from the top of the screen, and also turns on cells already passed
  kfFx.register("block-pass-reveal", (el, { options, reduce, scroller }) => {
    const vars = {
      "--fx-dur": options.dur != null ? `${+options.dur}s` : null,
      "--fx-delay": options.delay != null ? `${+options.delay}s` : null,
      "--fx-ease": options.ease || null,
      "--fx-show": options.show != null ? `${+options.show}s` : null,
      "--fx-fade": options.fade != null ? `${+options.fade}s` : null,
    };
    for (const [k, v] of Object.entries(vars)) if (v != null) el.style.setProperty(k, v);
    const box = scroller || window;
    const line = +(options.start ?? 0.8);
    // With offset, a line at px from the screen bottom is used instead of a ratio (narrow screens 768 and below use offset-sm). With back, it re-covers when going back below the line
    const px = () => (innerWidth <= 768 && options["offset-sm"] != null ? +options["offset-sm"] : options.offset != null ? +options.offset : null);
    const back = options.back != null && options.back !== "0" && options.back !== "false";
    const check = () => {
      const r = el.getBoundingClientRect();
      const top = scroller ? r.top - scroller.getBoundingClientRect().top : r.top;
      const h = scroller ? scroller.clientHeight : innerHeight;
      const at = px() != null ? h - px() : h * line;
      if (top >= at) { if (back) el.classList.remove("is-fx-in"); return; }
      el.classList.add("is-fx-in");
      if (!back) box.removeEventListener("scroll", check);
    };
    const off = () => {
      box.removeEventListener("scroll", check);
      el.classList.remove("is-fx-ready", "is-fx-in");
      Object.keys(vars).forEach((k) => el.style.removeProperty(k));
    };
    if (reduce) return off;
    el.classList.add("is-fx-ready");
    box.addEventListener("scroll", check, { passive: true });
    requestAnimationFrame(check);
    return off;
  });
})();
