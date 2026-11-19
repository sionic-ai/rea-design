(() => {
  // Picks the backdrop layer by the name of the section crossing a thin band (default 1%) at screen center, and loads the tone of the section crossing the top band of the screen onto the element
  kfFx.register("center-layer-swap", (el, { options }) => {
    const zones = [...el.querySelectorAll('[data-fx-part="zone"]')];
    const layers = [...el.querySelectorAll('[data-fx-part="layer"]')];
    if (!zones.length) return;
    const line = Math.min(99, Math.max(0, +(options.line ?? 50)));
    const pick = (key) => {
      if (!key || el.dataset.layer === key) return;
      el.dataset.layer = key;
      layers.forEach((l) => l.toggleAttribute("data-on", (l.dataset.key || "").split(/\s+/).includes(key)));
      el.dispatchEvent(new CustomEvent("fx:layer", { detail: { key } }));
    };
    const first = zones[0].dataset.key;
    pick(options.base || first);
    const mid = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && pick(e.target.dataset.key)), {
      rootMargin: `-${line}% 0% -${99 - line}% 0%`, threshold: 0,
    });
    zones.forEach((z) => z.dataset.key && mid.observe(z));
    const toned = zones.filter((z) => z.dataset.tone);
    const top = toned.length ? new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) el.dataset.tone = e.target.dataset.tone;
    }), { rootMargin: "0% 0% -99% 0%", threshold: 0 }) : null;
    toned.forEach((z) => top.observe(z));
    return () => {
      mid.disconnect();
      top?.disconnect();
      delete el.dataset.layer;
      delete el.dataset.tone;
      layers.forEach((l) => l.removeAttribute("data-on"));
    };
  });
})();
