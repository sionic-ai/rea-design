(() => {
  // Chains each marker’s on/off timing (first marker at first seconds, then each seconds apart) and sweeps the curtain away at sweep seconds.
  // When everything is done, fire fx:done — the consumer starts the hero animation then
  kfFx.register("mark-blink-sweep-loader", (el, { options, reduce }) => {
    const marks = [...el.querySelectorAll('[data-fx-part="mark"]')];
    const first = +(options.first ?? 0.5), each = +(options.each ?? 0.4);
    const sweepAt = +(options.sweep ?? 1.5), sweepDur = +(options.dur ?? 0.75);
    let at = 0;
    marks.forEach((m, i) => {
      const d = i === 0 ? first : each;
      m.style.setProperty("--fx-at", `${at}s`);
      m.style.setProperty("--fx-dur", `${d}s`);
      at += d;
    });
    el.style.setProperty("--fx-sweep-at", `${sweepAt}s`);
    el.style.setProperty("--fx-sweep-dur", `${sweepDur}s`);
    const end = reduce ? 0 : Math.max(at, sweepAt + sweepDur);
    const t = setTimeout(() => {
      el.setAttribute("aria-hidden", "true");
      el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    }, end * 1000);
    return () => {
      clearTimeout(t);
      marks.forEach((m) => { m.style.removeProperty("--fx-at"); m.style.removeProperty("--fx-dur"); });
      el.style.removeProperty("--fx-sweep-at");
      el.style.removeProperty("--fx-sweep-dur");
    };
  });
})();
