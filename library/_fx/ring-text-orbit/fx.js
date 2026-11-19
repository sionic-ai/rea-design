// Text runs around the circumference of each concentric ring in the SVG, from the innermost by the length list, alternating direction ring by ring, endlessly with no curve.
// Original (Brand site) layers date, time, place, price and ticket as five rings at 20 · 16.7 · 13.3 · 10 · 6.7s, with the night cell’s inner ring starting counterclockwise (-1) and the day cell clockwise (+1).
(() => {
  kfFx.register("ring-text-orbit", (el, { options, reduce }) => {
    const rings = [...el.querySelectorAll('[data-fx-part="ring"]')];
    const svg = el instanceof SVGSVGElement ? el : el.querySelector("svg");
    if (!rings.length || !svg || reduce) return;
    const vb = svg.viewBox.baseVal;
    const origin = options.origin || (vb && vb.width ? `${vb.x + vb.width / 2} ${vb.y + vb.height / 2}` : `${svg.clientWidth / 2} ${svg.clientHeight / 2}`);
    const durs = String(options.durs || "20,16.7,13.3,10,6.7").split(",").map(Number).filter((n) => n > 0);
    const first = +(options.dir ?? -1) < 0 ? -1 : 1;
    const tweens = rings.map((g, i) =>
      gsap.to(g, { rotation: 360 * (i % 2 ? -first : first), svgOrigin: origin, duration: durs[Math.min(i, durs.length - 1)] || 10, ease: "none", repeat: -1 })
    );
    return () => {
      tweens.forEach((t) => t.kill());
      gsap.set(rings, { clearProps: "transform" });
    };
  });
})();
