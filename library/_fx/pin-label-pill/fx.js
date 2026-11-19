(() => {
  // Small dot pin on the map — on hover the pill stretches to its own name width (.8s) while unfolding from half size to full size, and the name settles in .5s later.
  // Name width is re-measured with ResizeObserver so it fits even when the font arrives late, and stored in --fx-w.
  kfFx.register("pin-label-pill", (el, { reduce }) => {
    const label = el.querySelector('[data-fx-part="label"]'), body = el.querySelector('[data-fx-part="body"]');
    if (!label || !body) return;
    const size = () => parseFloat(getComputedStyle(el).getPropertyValue("--fx-size")) || 36;
    const fit = () => el.style.setProperty("--fx-w", `${Math.ceil(size() + 19 + label.scrollWidth + 27)}px`);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(label);
    document.fonts?.ready.then(fit);
    if (reduce) el.classList.add("fx-pill-still");
    return () => { ro.disconnect(); el.style.removeProperty("--fx-w"); el.classList.remove("fx-pill-still"); };
  });
})();
