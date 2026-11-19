(() => {
  // The faster the scroll, the more the boundary curve swells — each frame the scrolled distance (px) is taken as speed, divided by div to get a 0~1 ratio,
  // It follows that share with lerp and interpolates the path numerically from its first shape (d) to the swollen shape (data-to). When it stops, the velocity cools by decay and it slowly settles.
  // The two shapes must have the same number of commands and numbers (drawn with the same node structure)
  kfFx.register("speed-swell-edge", (el, { options, reduce, scroller }) => {
    const path = el.matches('path[data-to]') ? el : el.querySelector('[data-fx-part="path"]');
    if (!path) return;
    const from = path.getAttribute("d"), to = path.dataset.to;
    const re = /-?\d*\.?\d+(?:e-?\d+)?/gi;
    const a = (from || "").match(re) || [], b = (to || "").match(re) || [];
    if (!a.length || a.length !== b.length || reduce) return;
    let n = 0;
    const tpl = from.replace(re, () => `{${n++}}`);
    const A = a.map(Number), B = b.map(Number);
    const div = +options.div || 25, lerp = +(options.lerp ?? 0.1), decay = +(options.decay ?? 0.9);
    const pos = () => (scroller ? scroller.scrollTop : window.scrollY);
    let last = pos(), v = 0, p = 0, drawn = -1;
    const tick = () => {
      const y = pos();
      v = Math.max(v * decay, Math.abs(y - last));
      last = y;
      p += (Math.min(1, v / div) - p) * lerp;
      if (Math.abs(p - drawn) < 0.0005) return;
      drawn = p;
      let k = 0;
      path.setAttribute("d", tpl.replace(/\{\d+\}/g, () => { const x = A[k] + (B[k] - A[k]) * p; k++; return x.toFixed(2); }));
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); path.setAttribute("d", from); };
  });
})();
