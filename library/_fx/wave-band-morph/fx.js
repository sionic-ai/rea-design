// Inserts a wave panel (band surface + top and bottom wave svg) at the front of the element and passes length options as variables. If the caller already placed a layer, it is used as is
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const TOP = "M 0 45 Q 80 60.9 160 45 Q 240 29.1 320 22.5 Q 400 29.1 480 45 Q 560 60.9 640 67.5 Q 720 60.9 800 45 Q 880 29.1 960 22.5 Q 1040 29.1 1120 45 Q 1200 60.9 1280 67.5 L 1280 90 L 0 90 Z";
  const BOTTOM = "M 0 45 Q 80 29.1 160 45 Q 240 60.9 320 67.5 Q 400 60.9 480 45 Q 560 29.1 640 22.5 Q 720 29.1 800 45 Q 880 60.9 960 67.5 Q 1040 60.9 1120 45 Q 1200 29.1 1280 22.5 L 1280 0 L 0 0 Z";
  kfFx.register("wave-band-morph", (el, { options }) => {
    const set = (k, v) => { if (v != null) el.style.setProperty(k, v); };
    set("--fx-top", options.top != null ? `${+options.top}s` : null);
    set("--fx-bottom", options.bottom != null ? `${+options.bottom}s` : null);
    set("--fx-edge", options.edge != null ? `${+options.edge}px` : null);
    let layer = el.querySelector(':scope > [data-fx-part="layer"]');
    const made = !layer;
    if (made) {
      layer = document.createElement("div");
      layer.dataset.fxPart = "layer";
      layer.setAttribute("aria-hidden", "true");
      for (const [key, d] of [["top", TOP], ["bottom", BOTTOM]]) {
        const svg = document.createElementNS(NS, "svg");
        svg.setAttribute("viewBox", "0 0 1280 90");
        svg.setAttribute("preserveAspectRatio", "none");
        svg.dataset.key = key;
        const path = document.createElementNS(NS, "path");
        path.setAttribute("d", d);
        svg.append(path);
        layer.append(svg);
      }
      el.prepend(layer);
    }
    return () => {
      if (made) layer.remove();
      ["--fx-top", "--fx-bottom", "--fx-edge"].forEach((k) => el.style.removeProperty(k));
    };
  });
})();
