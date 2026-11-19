// Several slanted bars are drawn from the left in turn, and on each set beat exit to the same side (right) and are drawn again
(() => {
  kfFx.register("slash-bar-sweep", (el, { options, reduce }) => {
    const bars = [...el.querySelectorAll('[data-fx-part="bar"]')];
    if (!bars.length) return;
    if (reduce) { bars.forEach((b) => b.classList.add("is-shown")); return () => bars.forEach((b) => b.classList.remove("is-shown")); }

    const dur = +(options.dur ?? 1.6), each = +(options.each ?? 0.15);
    const every = +options.every || 9, gap = +(options.gap ?? 2.5);
    const ease = (options.ease || "1,0,0,1").replace(/^cubic-bezier\(|\)$/g, "");
    el.style.setProperty("--fx-dur", dur + "s");
    el.style.setProperty("--fx-ease", `cubic-bezier(${ease})`);

    const timers = new Set();
    const later = (fn, s) => { const t = setTimeout(() => { timers.delete(t); fn(); }, s * 1000); timers.add(t); };
    // When the class name changes and animation-name differs, the CSS animation restarts from the beginning — the original also removes and re-adds it in the same tick
    const drawIn = () => bars.forEach((b, i) => later(() => { b.classList.remove("is-start", "is-end"); b.classList.add("is-start"); }, (i + 1) * each));
    const sweepOut = () => bars.forEach((b, i) => later(() => b.classList.add("is-end"), (i + 1) * each));
    drawIn();
    const loop = setInterval(() => { sweepOut(); later(drawIn, gap); }, every * 1000);

    return () => {
      clearInterval(loop);
      timers.forEach(clearTimeout);
      bars.forEach((b) => b.classList.remove("is-start", "is-end"));
      el.style.removeProperty("--fx-dur");
      el.style.removeProperty("--fx-ease");
    };
  });
})();
