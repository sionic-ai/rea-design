(() => {
  // Text that fits in the cell is left as is, and only when it overflows is an extra copy attached so it flows — re-measured even if the font arrives late or the cell changes
  kfFx.register("overflow-marquee-line", (el, { options, reduce }) => {
    const text = el.querySelector('[data-fx-part="text"]') || el.firstElementChild;
    if (!text) return;
    // gap: gap between the two copies (px) · rate: px per second — if given, the length is measured as (text width + gap) ÷ rate (Brand news strip: gap 100 · 50 per second)
    const dur = +(options.dur ?? 10), gap = options.gap != null ? +options.gap : null, rate = +(options.rate ?? 0);
    if (gap != null) text.style.paddingRight = `${gap}px`;
    el.classList.add("fx-oml-on");
    let copy = null;
    const fit = () => {
      copy?.remove();
      copy = null;
      text.classList.remove("is-flow");
      if (reduce || text.scrollWidth - (gap ?? 0) <= el.clientWidth + 1) return;
      const len = rate > 0 ? text.scrollWidth / rate : dur;
      copy = text.cloneNode(true);
      copy.removeAttribute("data-fx-part");
      copy.setAttribute("aria-hidden", "true");
      el.append(copy);
      [text, copy].forEach((n) => { n.style.setProperty("--fx-dur", `${len}s`); n.classList.add("is-flow"); });
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    document.fonts?.ready.then(fit);
    fit();
    return () => {
      ro.disconnect();
      copy?.remove();
      text.classList.remove("is-flow");
      text.style.removeProperty("--fx-dur");
      if (gap != null) text.style.removeProperty("padding-right");
      el.classList.remove("fx-oml-on");
    };
  });
})();
