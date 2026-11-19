// When step text and the display piece sit side by side on one screen, a single step progress turns both on, and when they are stacked vertically like on a phone, the piece turns on separately as it passes its spot
(() => {
  kfFx.register("step-tile-mark", (el, { options, reduce, scroller }) => {
    const steps = [...el.querySelectorAll('[data-fx-part="step"]')], tiles = [...el.querySelectorAll('[data-fx-part="tile"]')];
    if (!steps.length) return;
    if (reduce) { [...steps, ...tiles].forEach((s) => s.classList.add("is-on")); return () => [...steps, ...tiles].forEach((s) => s.classList.remove("is-on")); }
    el.classList.add("is-fx-armed");
    const order = (t, i) => (t.dataset.key !== undefined ? Number(t.dataset.key) : i);
    const mark = (els, p, at) => els.forEach((s, i) => s.classList.toggle("is-on", p >= at(s, i) / steps.length));
    const apart = tiles.length > 0 && matchMedia(options.apart || "(max-width: 63.99rem)").matches;
    const sts = [ScrollTrigger.create({ scroller, trigger: steps[0].parentElement, start: options.start || "top 80%", end: options.end || "bottom 45%", onUpdate: (st) => { mark(steps, st.progress, (s, i) => i); if (!apart) mark(tiles, st.progress, order); } })];
    if (apart) sts.push(ScrollTrigger.create({ scroller, trigger: tiles[0].parentElement, start: options["tile-start"] || "top 85%", end: options["tile-end"] || "bottom 35%", onUpdate: (st) => mark(tiles, st.progress, order) }));
    return () => { sts.forEach((s) => s.kill()); el.classList.remove("is-fx-armed"); [...steps, ...tiles].forEach((s) => s.classList.remove("is-on")); };
  });
})();
