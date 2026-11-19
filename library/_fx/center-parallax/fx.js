// Pushes an element up or down by (panel center − its own center) × speed. Measured from the already pushed position, so the push converges to distance × speed/(1 + speed) —
// The original site measures it that way, so that amount is the original value. It re-measures on every scroll, so it follows whatever scroller is used (window·Lenis·inner panel)
(() => {
  kfFx.register("center-parallax", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    const speed = +(options.speed ?? 0.2), bp = +(options.bp || 768);
    const narrow = options.sp != null ? +options.sp : speed * 0.5;
    // max — push limit (px). scale — scale applied together (so cell edges never go empty when pushed). lerp — each scroll signal closes only that fraction of the remaining distance
    // (When scrolling stops it approaches then stops — Brand strip photo: speed −.05 · max 15 · scale 1.1 · lerp .08)
    const max = options.max != null ? Math.abs(+options.max) : Infinity;
    const scale = options.scale != null ? ` scale(${+options.scale})` : "";
    const lerp = Math.min(1, Math.max(0, +(options.lerp ?? 1)));
    // at — reference line (ratio of screen height, default .5 center), self — which height of the element is measured (ratio of its own height, default .5 center).
    // Brand at 0 · self −.5 · speed −2×depth: (top − height/2) × 2 × depth — the lower down, the more it is pushed, so front layers flow faster
    const at = +(options.at ?? 0.5), self = +(options.self ?? 0.5);
    // span: on — Rellax(center) formula. Leave out the pushed offset, measure in place: moves by (own anchor point − screen reference line) × speed × 100 / (own height + screen height),
    // While passing through the screen once, everything shifts by speed × 100px. Like Rellax, a positive sign means it rises faster than the scroll (brand photo·wordmark .2·.5)
    const span = options.span === "on";
    const target = scroller || window;
    let y = 0;
    const update = () => {
      const s = innerWidth <= bp ? narrow : speed;
      const r = el.getBoundingClientRect();
      const top = scroller ? scroller.getBoundingClientRect().top : 0;
      const vh = scroller ? scroller.clientHeight : innerHeight;
      if (span) {
        y = Math.round((s * 100 * (r.top - y - top + r.height * self - vh * at)) / (r.height + vh));
        el.style.transform = `translateY(${y}px)${scale}`;
        return;
      }
      const want = Math.max(-max, Math.min(max, (vh * at - (r.top - top + r.height * self)) * s));
      y = lerp >= 1 ? want : y + (want - y) * lerp;
      el.style.transform = `translateY(${y}px)${scale}`;
    };
    target.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => {
      target.removeEventListener("scroll", update);
      removeEventListener("resize", update);
      ro.disconnect();
      el.style.transform = "";
    };
  });
})();
