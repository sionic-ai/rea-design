(() => {
  // When a section overlaps the screen at all, is-in (the flipped backdrop stands up over 1s ease-in and the top and bottom bands grow), once fully past upward is-above, while still below is-below (lifts over 1s ease-out).
  // The original measures with getBoundingClientRect on every scroll — the same criterion is produced with IntersectionObserver (margin 0)
  kfFx.register("view-tone-flip", (el, { scroller }) => {
    if (!el.querySelector('[data-fx-part="sheet"]')) return;
    const set = (inView, above) => {
      el.classList.toggle("is-in", inView);
      el.classList.toggle("is-above", !inView && above);
      el.classList.toggle("is-below", !inView && !above);
      if (inView) el.dispatchEvent(new CustomEvent("fx:show"));
    };
    const io = new IntersectionObserver(([e]) => set(e.isIntersecting, e.boundingClientRect.bottom < (e.rootBounds?.top ?? 0)), { root: scroller || null, threshold: 0 });
    io.observe(el);
    return () => { io.disconnect(); el.classList.remove("is-in", "is-above", "is-below"); };
  });
})();
