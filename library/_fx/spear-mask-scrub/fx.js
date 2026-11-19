(() => {
  // Spearhead mask — a spearhead shape stretches from one corner of the plate (default bottom right) toward the opposite corner, bound to scroll, opening the plate.
  // The endpoint goes past the diagonal by progress × 1.8, the two edges attached to the corner open by a .01~1 share, and the line joining the endpoint and the two edges is a quadratic curve with the middle pulled toward the corner by curve
  const DIRS = {
    "br-tl": (D, l, w, h) => ({ p0: [(1 - D) * w, (1 - D) * h], p1: [w, (1 - l) * h], p2: [w, h], p3: [(1 - l) * w, h] }),
    "bl-tr": (D, l, w, h) => ({ p0: [D * w, (1 - D) * h], p1: [0, (1 - l) * h], p2: [0, h], p3: [l * w, h] }),
    "tr-bl": (D, l, w, h) => ({ p0: [(1 - D) * w, D * h], p1: [w, l * h], p2: [w, 0], p3: [(1 - l) * w, 0] }),
    "tl-br": (D, l, w, h) => ({ p0: [D * w, D * h], p1: [0, l * h], p2: [0, 0], p3: [l * w, 0] }),
  };
  kfFx.register("spear-mask-scrub", (el, { options, reduce, scroller }) => {
    const mask = el.querySelector('[data-fx-part="mask"]');
    if (!mask) return;
    const dir = DIRS[options.direction] ? options.direction : "br-tl";
    const curve = +(options.curve ?? 0.2), reach = +(options.reach ?? 1.8);
    const from = +(options.from ?? 0), to = +(options.to ?? 1);
    const span = (v, a, b) => (b <= a ? 0 : Math.max(0, Math.min(1, (v - a) / (b - a))));
    const f = (q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`;
    let last = 0;
    const draw = (p) => {
      last = p;
      const t = span(p, from, to), w = mask.offsetWidth, h = mask.offsetHeight;
      if (!w || !h) return;
      const { p0, p1, p2, p3 } = DIRS[dir](t * reach, span(t, 0.01, 1), w, h);
      const T = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], X = [(p3[0] + p0[0]) / 2, (p3[1] + p0[1]) / 2];
      const c1 = [T[0] + (p2[0] - T[0]) * curve, T[1] + (p2[1] - T[1]) * curve], c2 = [X[0] + (p2[0] - X[0]) * curve, X[1] + (p2[1] - X[1]) * curve];
      mask.style.clipPath = `path('M ${f(p0)} Q ${f(c1)} ${f(p1)} L ${f(p2)} L ${f(p3)} Q ${f(c2)} ${f(p0)} Z')`;
    };
    if (reduce) { mask.style.clipPath = "none"; return () => { mask.style.clipPath = ""; }; }
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: el, ...(scroller && { scroller }),
      start: options.start || "top top", end: options.end || "bottom bottom",
      onUpdate: (self) => draw(self.progress), onRefresh: (self) => draw(self.progress),
    });
    const ro = new ResizeObserver(() => draw(last));
    ro.observe(mask);
    draw(st.progress || 0);
    return () => { st.kill(); ro.disconnect(); mask.style.clipPath = ""; };
  });
})();
