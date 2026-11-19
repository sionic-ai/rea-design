(() => {
  // Large wordmark graphic in the header line (data-fx-part="mark", or the svg inside the element if absent) is tied directly to scroll (no curve) while it descends from the top by the element height
  // Shrinks from its own height down to min px, and stays at min below that. Back at the top it returns to the initial height (auto). If the width is at or below min-width it does not shrink.
  kfFx.register("wordmark-scroll-shrink", (el, { options, reduce, scroller }) => {
    const marks = [...el.querySelectorAll('[data-fx-part="mark"]')];
    if (!marks.length) marks.push(...el.querySelectorAll("svg"));
    if (!marks.length) return;
    const min = +(options.min ?? 36), wide = +(options["min-width"] ?? 768);
    const box = scroller && scroller !== window ? scroller : null;
    const top = () => (box ? box.scrollTop : document.body.scrollTop + document.documentElement.scrollTop);
    let dist = 1, full = 0, t = 0;
    const measure = () => {
      marks.forEach((m) => (m.style.height = "auto"));
      // As in the original, the shrink distance is the element height (plus its inner scroll), with the image’s own height measured as the start height
      dist = options.dist != null ? +options.dist : el.clientHeight + el.scrollTop || 1;
      full = marks[0].getBoundingClientRect().height;
    };
    const on = () => {
      if (innerWidth <= wide || reduce) return;
      const p = top() / dist;
      const h = p <= 0 ? "auto" : p > 1 ? `${min}px` : `${min + (full - min) * (1 - p)}px`;
      marks.forEach((m) => (m.style.height = h));
    };
    const resize = () => { marks.forEach((m) => (m.style.height = "auto")); clearTimeout(t); t = setTimeout(() => { measure(); on(); }, 150); };
    measure();
    on();
    const target = box || window;
    target.addEventListener("scroll", on, { passive: true });
    addEventListener("resize", resize);
    return () => { target.removeEventListener("scroll", on); removeEventListener("resize", resize); clearTimeout(t); marks.forEach((m) => m.style.removeProperty("height")); };
  });
})();
