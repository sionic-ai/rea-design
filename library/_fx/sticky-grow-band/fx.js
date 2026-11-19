// Passes the progress of the panel (track) crossing the screen (0 when its top touches the screen bottom, 1 when its bottom passes the screen top) as --fx-p.
// The size and corners of the center photo window on the pinned stage are set by fx.css from the from→to range of this value — tied directly to scroll without a curve.
(() => {
  kfFx.register("sticky-grow-band", (el, { options, reduce, scroller }) => {
    const media = el.querySelector('[data-fx-part="media"]');
    if (!media) return;
    const from = +(options.from ?? 0.35);
    let to = +(options.to ?? 0.65);
    if (!(to > from)) to = from + 0.0001;
    el.style.setProperty("--fx-from", String(from));
    el.style.setProperty("--fx-to", String(to));
    const clear = () => ["--fx-p", "--fx-from", "--fx-to"].forEach((p) => el.style.removeProperty(p));
    if (reduce || !window.ScrollTrigger) {
      el.style.setProperty("--fx-p", "1");
      return clear;
    }
    const set = (p) => el.style.setProperty("--fx-p", p.toFixed(5));
    const st = ScrollTrigger.create({ trigger: el, scroller, start: "top bottom", end: "bottom top", onUpdate: (s) => set(s.progress) });
    set(st.progress);
    return () => { st.kill(); clear(); };
  });
})();
