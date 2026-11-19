(() => {
  // Original: first advance at 5/6 of the 4s interval, when advancing, the previous section is left as ”under” and lowered after 60% of the interval
  kfFx.register("corner-wipe-slides", (el, { options, reduce }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (slides.length < 2 || reduce) return;
    const every = (+options.every || 4) * 1000;
    const timers = [];
    let i = 0;
    const move = () => {
      const cur = slides[i], n = (i + 1) % slides.length, next = slides[n];
      el.dispatchEvent(new CustomEvent("fx:slide", { detail: { index: n } }));
      cur.dataset.state = "under";
      next.dataset.state = "on";
      timers.push(setTimeout(() => (cur.dataset.state = "off"), 0.6 * every));
      i = n;
      timers.push(setTimeout(move, every));
    };
    timers.push(setTimeout(move, 0.833333333333333 * every));
    return () => { timers.forEach(clearTimeout); slides.forEach((s) => delete s.dataset.state); };
  });
})();
