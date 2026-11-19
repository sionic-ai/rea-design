(() => {
  // The slots of the photo grid switch to the next photo in turn — in each slot, the next of the stacked photos (layer) opens from bottom to top (clip-path inset 100% → 0, 1.2s power2.out)
  // The image inside approaches from 1.2x to 1x (1.4s). Once a cell starts opening, the next one is scheduled after one of 1.8 · 2 · 2.2 · 2.4s (first cell only .4s). Cell order follows the cell’s data-step (space-separated numbers)
  kfFx.register("clip-rise-swap", (el, { options, reduce }) => {
    const cells = [...el.querySelectorAll('[data-fx-part="cell"]')];
    if (!cells.length) return;
    const steps = [];
    cells.forEach((c) => (c.dataset.step || "").split(/\s+/).filter(Boolean).forEach((n) => (steps[+n] = c)));
    const order = steps.map((c, i) => [i, c]).filter(([, c]) => c);
    if (!order.length || reduce) return;
    const delays = String(options.delays || "1.8,2,2.2,2.4").split(",").map(Number);
    const first = +(options.first ?? 0.4), dur = +(options.dur ?? 1.2), zoomDur = +(options["zoom-dur"] ?? 1.4), zoom = +(options.zoom ?? 1.2);
    const ease = options.ease ? kfFx.ease(options.ease, "power2.out") : "power2.out";
    const layersOf = (c) => [...c.querySelectorAll('[data-fx-part="layer"]')];
    const at = new Map(cells.map((c) => [c, 0]));
    cells.forEach((c) => layersOf(c).forEach((l, i) => l.classList.toggle("is-current", i === 0)));
    let k = 0, tw = [];
    const next = (delay) => {
      const [, cell] = order[k];
      const layers = layersOf(cell);
      if (layers.length < 2) { k = (k + 1) % order.length; return next(delay); }
      const to = (at.get(cell) + 1) % layers.length;
      const layer = layers[to], img = layer.firstElementChild;
      layers.forEach((l, i) => l.classList.toggle("is-current", i === to));
      gsap.set(layer, { clipPath: "inset(100% 0% 0% 0%)" });
      if (img) gsap.set(img, { scale: zoom });
      tw = [
        gsap.to(layer, { delay, duration: dur, ease, clipPath: "inset(0% 0% 0% 0%)", onStart: () => {
          at.set(cell, to);
          k = (k + 1) % order.length;
          next(delays[Math.floor(Math.random() * delays.length)]);
        } }),
        img && gsap.to(img, { delay, duration: zoomDur, ease, scale: 1 }),
      ].filter(Boolean);
    };
    next(first);
    return () => { tw.forEach((t) => t.kill()); gsap.killTweensOf(el.querySelectorAll('[data-fx-part="layer"], [data-fx-part="layer"] > *')); gsap.set(el.querySelectorAll('[data-fx-part="layer"], [data-fx-part="layer"] > *'), { clearProps: "clipPath,transform" }); };
  });
})();
