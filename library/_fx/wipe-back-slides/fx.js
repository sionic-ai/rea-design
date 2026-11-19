(() => {
  kfFx.register("wipe-back-slides", (el, { options, reduce }) => {
    const slides = () => [...el.children].filter((c) => c.matches('[data-fx-part="slide"]'));
    if (slides().length < 2) return;
    // The original chains ‹wipe the top sheet → after swap seconds send that sheet to the bottom → rest for hold seconds› with setTimeout — if the wipe delay (--fx-delay) is longer than swap, the sheet goes back half-wiped (same as the original).
    const first = +(options.first ?? 3.6) * 1000, hold = +(options.hold ?? 3.5) * 1000, swap = +(options.swap ?? 1.1) * 1000;
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
    const cycle = () => {
      const list = slides();
      const top = list[list.length - 1];
      if (!top) return;
      top.classList.add("is-fx-out");
      later(() => {
        top.classList.remove("is-fx-out");
        el.insertBefore(top, el.firstElementChild);
        later(cycle, hold);
      }, swap);
    };
    const start = () => {
      el.classList.add("is-fx-ready");
      if (!reduce) later(cycle, first);
    };
    // The original starts the clock after everything, images included, has loaded (load)
    if (options.on === "ready" || document.readyState === "complete") start();
    else addEventListener("load", start, { once: true });
    return () => {
      removeEventListener("load", start);
      timers.forEach(clearTimeout);
      el.classList.remove("is-fx-ready");
      slides().forEach((s) => s.classList.remove("is-fx-out"));
    };
  });
})();
