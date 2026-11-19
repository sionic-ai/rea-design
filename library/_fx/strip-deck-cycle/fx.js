(() => {
  // Original: on every tick the first card moves to the end (nth-child positions shift, so all slide one slot left), and the new first card opens.
  // close seconds after opening, the front card folds from the right, and open seconds later the next card is pre-unfolded — so just before a flip the second card is already open.
  kfFx.register("strip-deck-cycle", (el, { options, reduce }) => {
    const cards = [...el.children].filter((n) => n.getAttribute("data-fx-part") === "card");
    if (cards.length < 2) return;
    const every = (+options.every || 5) * 1000;
    const openNext = +(options.open ?? 4) * 1000;
    const closeAt = +(options.close ?? 3) * 1000;
    const hold = +(options.hold ?? 3) * 1000;
    if (options.dur != null) el.style.setProperty("--fx-dur", +options.dur + "s");
    if (options["close-dur"] != null) el.style.setProperty("--fx-close-dur", +options["close-dur"] + "s");
    let order = cards.slice();
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const place = () => order.forEach((c, i) => {
      c.style.setProperty("--fx-i", i);
      c.toggleAttribute("data-first", i === 0);
    });
    const set = (c, s) => { if (s) c.dataset.state = s; else delete c.dataset.state; };
    const activate = () => {
      order.forEach((c) => set(c, ""));
      const first = order[0], second = order[1];
      set(first, "active");
      el.dispatchEvent(new CustomEvent("fx:slide", { detail: { index: cards.indexOf(first) } }));
      later(() => set(second, "active"), openNext);
      later(() => {
        set(first, "active close");
        later(() => { if (order[0] !== first) set(first, ""); }, hold);
      }, closeAt);
    };
    place();
    set(order[0], "active");
    if (reduce) return () => { cards.forEach((c) => { set(c, ""); c.style.removeProperty("--fx-i"); c.removeAttribute("data-first"); }); };
    activate();
    const tick = setInterval(() => {
      order = order.slice(1).concat(order[0]);
      place();
      activate();
    }, every);
    return () => {
      clearInterval(tick);
      timers.forEach(clearTimeout);
      cards.forEach((c) => { set(c, ""); c.style.removeProperty("--fx-i"); c.removeAttribute("data-first"); });
      el.style.removeProperty("--fx-dur");
      el.style.removeProperty("--fx-close-dur");
    };
  });
})();
