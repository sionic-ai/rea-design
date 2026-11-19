// Drawn road and stops: a thick SVG road (path) is drawn up to the height the 80% screen line reaches, and the stops on the road (stop) become is-in in turn
// Staggered at different speeds. On reaching the path end, is-blown is added to the panel to turn on the ending scene (like a volcano eruption) — Brand site zone path · about path
(() => {
  const SPEEDS = [0.06, 0.09, 0.12];
  kfFx.register("trail-stop-draw", (el, { options, reduce }) => {
    const paths = [...el.querySelectorAll('[data-fx-part="path"]')];
    if (!paths.length) return;
    const stops = [...el.querySelectorAll('[data-fx-part="stop"]')];
    const end = el.querySelector('[data-fx-part="end"]');
    const line = +(options.line ?? 0.8), by = options.by || "line", lerp = +(options.lerp ?? 0), endAt = +(options.end ?? 0.93);
    const blown = options.blown || "is-blown";
    const narrow = matchMedia("(max-width: 768px)");
    let path = paths[0], vbH = 1, top = 0, height = 1, ys = [], endTop = Infinity, raf = 0, shown = 0, target = 0, isBlown = false;
    const items = stops.map((node, i) => ({ node, at: +(node.dataset.at ?? 0), speed: node.dataset.speed != null ? +node.dataset.speed : SPEEDS[i % 3], base: 0, on: false, erupt: node.hasAttribute("data-erupt") }));

    const toFrac = (y) => {
      if (y <= ys[0]) return 0;
      if (y >= ys[256]) return 1;
      let a = 0, b = 256;
      while (b - a > 1) { const m = (a + b) >> 1; if (ys[m] <= y) a = m; else b = m; }
      return (a + (y - ys[a]) / (ys[b] - ys[a] || 1)) / 256;
    };
    const paint = () => {
      path.style.strokeDashoffset = (1 - shown).toFixed(4);
      el.style.setProperty("--draw", shown.toFixed(4));
      const vh = innerHeight, mid = scrollY + vh / 2, cut = scrollY + line * vh;
      const atBottom = scrollY >= document.documentElement.scrollHeight - 1.12 * vh, gap = endTop - scrollY;
      const boom = reduce || (isBlown ? gap <= 1.25 * vh || atBottom : shown >= endAt && (gap <= 0.9 * vh || atBottom));
      if (boom !== isBlown) { isBlown = boom; el.classList.toggle(blown, boom); }
      for (const it of items) {
        if (it.erupt) { if (it.on !== isBlown) { it.on = isBlown; it.node.classList.toggle("is-in", isBlown); } continue; }
        const on = reduce || (by === "path" ? shown >= it.at - 0.015 * it.on : cut >= it.base - vh * 0.02 * it.on);
        if (on !== it.on) { it.on = on; it.node.classList.toggle("is-in", on); }
        it.node.style.setProperty("--par-y", reduce ? "0px" : `${((mid - it.base) * it.speed * (narrow.matches ? 0.3 : 1)).toFixed(1)}px`);
      }
    };
    const chase = () => { raf = 0; const d = target - shown; shown = Math.abs(d) < 5e-4 ? target : shown + d * lerp; paint(); if (shown !== target) raf = requestAnimationFrame(chase); };
    const onScroll = () => {
      const svgY = ((scrollY + line * innerHeight - top) / height) * vbH;
      target = reduce ? 1 : toFrac(svgY);
      if (lerp > 0 && !reduce) { if (!raf) raf = requestAnimationFrame(chase); }
      else { shown = target; paint(); }
    };
    const measure = () => {
      path = paths.find((p) => p.closest("svg").getBoundingClientRect().width > 0) || paths[0];
      const svg = path.closest("svg"), vb = svg.viewBox.baseVal, box = svg.getBoundingClientRect();
      vbH = vb && vb.height ? vb.height : box.height;
      const vbW = vb && vb.width ? vb.width : box.width;
      top = box.top + scrollY; height = box.height || 1;
      const len = path.getTotalLength();
      const pts = [];
      for (let i = 0; i <= 256; i++) pts.push(path.getPointAtLength((i / 256) * len));
      let hi = -Infinity;
      ys = pts.map((p) => (hi = Math.max(hi, p.y)));
      const host = el.getBoundingClientRect();
      for (const it of items) {
        if (!it.erupt && it.node.dataset.at != null && !it.node.hasAttribute("data-fixed")) {
          const p = path.getPointAtLength(it.at * len);
          it.node.style.left = `${((p.x / vbW) * box.width + box.left - host.left) / host.width * 100}%`;
          it.node.style.top = `${((p.y / vbH) * box.height + box.top - host.top) / host.height * 100}%`;
        }
        it.node.style.setProperty("--par-y", "0px");
        it.base = it.node.getBoundingClientRect().top + scrollY + it.node.offsetHeight / 2;
      }
      endTop = end ? end.getBoundingClientRect().top + scrollY + end.offsetHeight * 0.3 : Infinity;
      onScroll();
    };
    const first = requestAnimationFrame(measure);
    addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => {
      cancelAnimationFrame(first); cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      ro.disconnect();
      paths.forEach((p) => p.style.removeProperty("stroke-dashoffset"));
      el.style.removeProperty("--draw");
      el.classList.remove(blown);
      items.forEach((it) => { it.node.classList.remove("is-in"); it.node.style.removeProperty("--par-y"); });
    };
  });
})();
