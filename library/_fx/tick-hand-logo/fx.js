// The hand of the disc inside the logo ticks like a clock by 30° every 750ms with no in-between values, and each time it completes a full turn back to 12 o’clock
// The circle color changes to the next color (original Brand logo — yellow → green → red → blue …). The needle’s axis is the circle’s center.
(() => {
  const DEFAULT = "var(--kf-accent), var(--kf-success), var(--kf-danger), var(--fx-tick-blue, var(--kf-ink)), var(--kf-warning)";
  kfFx.register("tick-hand-logo", (el, { options, reduce }) => {
    const hand = el.querySelector('[data-fx-part="hand"]');
    const disc = el.querySelector('[data-fx-part="disc"]');
    if (!hand || !disc) return;
    const step = +(options.step ?? 30);
    const every = +(options.every || 750);
    const colors = String(options.colors || DEFAULT).split(/,(?![^(]*\))/).map((c) => c.trim()).filter(Boolean);
    let angle = +(options.start ?? 0), idx = 0;

    // Angle, axis and color are used only as variables on the panel (el) — like the original, the hand element’s own style is not touched, and CSS rotates it via the variables
    // Axis = Circle center. Inside an SVG it’s viewBox coordinates, in HTML it’s the circle center relative to the hand box
    const center = () => {
      if (disc.getBBox) {
        const b = disc.getBBox();
        el.style.setProperty("--fx-tick-box", "view-box");
        el.style.setProperty("--fx-tick-origin", `${b.x + b.width / 2}px ${b.y + b.height / 2}px`);
      } else {
        const d = disc.getBoundingClientRect(), h = hand.getBoundingClientRect();
        el.style.setProperty("--fx-tick-origin", `${d.left + d.width / 2 - h.left}px ${d.top + d.height / 2 - h.top}px`);
      }
    };
    const paint = () => {
      el.style.setProperty("--fx-tick-rotate", angle + "deg");
      el.style.setProperty("--fx-tick-color", colors[idx % colors.length]);
    };
    center();
    paint();
    const clear = () => ["--fx-tick-rotate", "--fx-tick-color", "--fx-tick-origin", "--fx-tick-box"].forEach((v) => el.style.removeProperty(v));
    if (reduce || !colors.length) return clear;

    const tick = () => {
      angle = (angle + step) % 360;
      if (angle === 0) idx += 1;
      paint();
    };
    let timer = setInterval(tick, every);
    // Pauses in a hidden tab so it doesn’t pile up, resumes on return
    const vis = () => {
      clearInterval(timer);
      timer = document.hidden ? null : setInterval(tick, every);
    };
    document.addEventListener("visibilitychange", vis);
    const ro = new ResizeObserver(center);
    ro.observe(el);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", vis);
      ro.disconnect();
      clear();
    };
  });
})();
