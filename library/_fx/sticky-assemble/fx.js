// Part pieces are stacked vertically 50px apart, each stuck sticky to the bottom of the screen with a different bottom value, so scrolling down they catch up one by one and assemble into a single bag.
// Received per piece via data-* (original Brand Product pencil as is):
//   data-bottom      distance to float from the screen bottom when attached (px, negative hangs off screen)
//   data-sticky-y    the top edge of the panel must rise this much from the bottom of the screen before it sticks — before that it is held aside in place by data-origin-y
//   data-visible-y   must rise this far to become visible
//   data-ease-start·data-ease-end·data-start-y  over this range bottom is pulled up by (end − (start-y − origin-y)) (proportional, no Curve)
(() => {
  const KEYS = ["bottom", "easeStart", "easeEnd", "originY", "startY", "stickyY", "visibleY"];
  kfFx.register("sticky-assemble", (el, { scroller }) => {
    const pieces = [...el.querySelectorAll(':scope > [data-fx-part="piece"]')].map((n) => {
      const o = { n };
      for (const k of KEYS) if (n.dataset[k] != null && n.dataset[k] !== "") o[k] = parseFloat(n.dataset[k]);
      return o;
    });
    if (!pieces.length) return;
    const target = scroller || window;
    let vh = innerHeight, raf = 0;
    const draw = () => {
      raf = 0;
      const top = el.getBoundingClientRect().top - (scroller ? scroller.getBoundingClientRect().top : 0);
      const n = vh - top;
      for (const p of pieces) {
        let position = "relative", t = "unset", b = "unset";
        if (!p.stickyY || n >= p.stickyY) { position = "sticky"; b = `${p.bottom}px`; }
        else t = `${p.originY}px`;
        if (p.easeStart && p.easeEnd && p.bottom && p.startY && p.originY) {
          if (n > p.easeStart) {
            const span = p.easeEnd - p.easeStart, dist = p.easeEnd - (p.startY - p.originY);
            b = `${p.bottom + (1 - (p.easeEnd - n) / span) * dist}px`;
          } else b = `${p.bottom}px`;
        }
        p.n.style.position = position;
        p.n.style.top = t;
        p.n.style.bottom = b;
        p.n.style.visibility = !p.visibleY || n >= p.visibleY ? "visible" : "hidden";
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(draw); };
    const onResize = () => { vh = scroller ? scroller.clientHeight : innerHeight; onScroll(); };
    target.addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    onResize();
    draw();
    return () => {
      cancelAnimationFrame(raf);
      target.removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      for (const p of pieces) for (const k of ["position", "top", "bottom", "visibility"]) p.n.style.removeProperty(k);
    };
  });
})();
