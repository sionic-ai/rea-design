// Cell logos turn on with a random delay per cell — the first time they fade in slowly (1s), and after settling (1.2s) they blink off and on briefly (.3s).
// Each time it turns off, a new delay is drawn so that it fills up in a different order every time it turns back on. It follows when another part (hover-stage-swap) fires fx:off and fx:on
(() => {
  kfFx.register("cell-scatter-fade", (el, { options, reduce }) => {
    const cells = [...el.querySelectorAll('[data-fx-part="cell"]')];
    if (!cells.length) return;
    const spread = +(options.spread ?? 0.35), dur = +(options.dur ?? 1), after = +(options.after ?? 0.3);
    const settle = +(options.settle ?? 1.2), back = +(options.back ?? 0), start = +(options.delay ?? 0);
    const shuffle = (base) => cells.forEach((c) => c.style.setProperty("--fx-cell-delay", `${(base + Math.random() * spread).toFixed(3)}s`));
    if (reduce) { el.classList.add("is-on"); return () => el.classList.remove("is-on"); }
    el.style.setProperty("--fx-dur", `${dur}s`);
    if (options.ease) el.style.setProperty("--fx-ease", options.ease);
    el.classList.add("is-armed");
    shuffle(start);
    // Draw the turned-off panel once before turning it on so the transition runs
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("is-on")));
    const t = setTimeout(() => el.style.setProperty("--fx-dur", `${after}s`), settle * 1000);
    const off = () => { el.classList.remove("is-on"); shuffle(0); };
    // The original turns back on with the delay drawn when it went off — if back is given, it draws a new delay pushed back by that much
    const on = () => { if (back) shuffle(back); el.classList.add("is-on"); };
    el.addEventListener("fx:off", off);
    el.addEventListener("fx:on", on);
    return () => {
      cancelAnimationFrame(raf); clearTimeout(t);
      el.removeEventListener("fx:off", off); el.removeEventListener("fx:on", on);
      el.classList.remove("is-armed", "is-on");
      el.style.removeProperty("--fx-dur"); el.style.removeProperty("--fx-ease");
      cells.forEach((c) => c.style.removeProperty("--fx-cell-delay"));
    };
  });
})();
