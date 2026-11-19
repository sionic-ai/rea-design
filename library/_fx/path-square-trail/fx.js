(() => {
  kfFx.register("path-square-trail", (el, { options, reduce, scroller }) => {
    const svg = el.querySelector("svg"), paths = [...el.querySelectorAll('[data-fx-part="path"]')];
    if (!svg || !paths.length) return;
    const N = +(options.count || 100), SIZE = +(options.size || 100), NS = "http://www.w3.org/2000/svg";
    const trails = paths.map((p) => {
      const g = document.createElementNS(NS, "g");
      g.setAttribute("class", "fx-pst");
      const rects = Array.from({ length: N }, () => { const r = document.createElementNS(NS, "rect"); r.style.visibility = "hidden"; g.append(r); return r; });
      svg.append(g);
      return { p, rects, state: { in: reduce ? 1 : 0, out: 0 } };
    });
    // Cells are sized in screen px — measured each time so they stay the same size as the viewBox grows and shrinks
    const place = () => {
      const vb = svg.viewBox.baseVal, k = vb && vb.width ? vb.width / Math.max(1, svg.clientWidth) : 1, s = SIZE * k;
      trails.forEach(({ p, rects }) => {
        const L = p.getTotalLength();
        rects.forEach((r, i) => {
          const pt = p.getPointAtLength((L * i) / (N - 1));
          r.setAttribute("x", pt.x - s / 2); r.setAttribute("y", pt.y - s / 2); r.setAttribute("width", s); r.setAttribute("height", s);
        });
      });
    };
    const paint = (t) => t.rects.forEach((r, i) => (r.style.visibility = i < Math.round(t.state.in * N) && i >= Math.round(t.state.out * N) ? "visible" : "hidden"));
    place();
    const ro = new ResizeObserver(place);
    ro.observe(svg);
    trails.forEach(paint);
    if (reduce) return () => { ro.disconnect(); trails.forEach((t) => t.rects[0].parentNode.remove()); };
    const rest = +(options.rest ?? 3), dIn = +(options.in ?? 1), dOut = +(options.out ?? 1);
    const order = trails.slice(1).concat(trails[0]);
    const tl = gsap.timeline({ repeat: -1, scrollTrigger: { trigger: el, scroller, start: "top bottom", end: "bottom top", toggleActions: "restart pause restart pause" } });
    order.forEach((t) => {
      tl.set(t.state, { in: 0, out: 0, onComplete: () => paint(t) }, `>+${rest}`)
        .to(t.state, { in: 1, duration: dIn, ease: "none", onUpdate: () => paint(t) })
        .to(t.state, { out: 1, duration: dOut, ease: "none", onUpdate: () => paint(t) });
    });
    return () => { tl.scrollTrigger?.kill(); tl.kill(); ro.disconnect(); trails.forEach((t) => t.rects[0].parentNode.remove()); };
  });
})();
