// Several photo columns flow straight in opposite directions for a very long time (75s by default) as soon as they open and stop at the end — not a repeating band but a slow one-time pan.
// The original (STUDIO appear) moves translate with a single transition, so it is applied the same way.
(() => {
  kfFx.register("drift-columns", (el, { options, reduce }) => {
    const cols = [...el.querySelectorAll('[data-fx-part="col"]')];
    if (!cols.length) return;
    const dur = +(options.dur ?? 75);
    const dist = +(options.dist ?? 1000);
    const delay = +(options.delay ?? 0);
    // Even columns come down from above (-dist → 0) and odd columns rise upward (0 → -dist) — offset lifts the odd column’s start position even higher.
    const offset = +(options.offset ?? 0);
    const from = (i) => (i % 2 === 0 ? -dist : -offset);
    const to = (i) => (i % 2 === 0 ? 0 : -dist - offset);
    const place = (fn, animate) => cols.forEach((c, i) => {
      c.style.transition = animate ? `translate ${dur}s linear ${delay}s` : "none";
      c.style.translate = `0 ${fn(i)}px`;
    });
    if (reduce) { place(to, false); return () => cols.forEach((c) => { c.style.translate = ""; c.style.transition = ""; }); }
    place(from, false);
    let raf = 0, started = false;
    const go = () => {
      if (started) return;
      started = true;
      // Paint the start position once, then give the end position, so the transition applies
      raf = requestAnimationFrame(() => { void el.offsetHeight; place(to, true); });
    };
    if (options.wait === "play") el.addEventListener("fx:play", go);
    else go();
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("fx:play", go);
      cols.forEach((c) => { c.style.translate = ""; c.style.transition = ""; });
    };
  });
})();
