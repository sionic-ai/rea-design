(() => {
  // Place two small squares at each outer corner of the grid, one horizontal and one vertical, each offset by the distance outside the corner.
  // The grid enters from the bottom of the screen and stays tied to scroll until its bottom edge reaches 75% of the screen, the two sides converging toward the edges, while full-width thin lines above and below the grid are drawn from the left
  kfFx.register("corner-dots-converge", (el, { options, reduce }) => {
    const dist = +(options.dist ?? 128);
    const scrub = +(options.scrub ?? 1);
    const start = options.start || "top bottom";
    const end = options.end || "bottom 75%";
    const lines = options.lines !== "off";
    const layer = document.createElement("div");
    layer.className = "fx-cdc-layer";
    layer.setAttribute("aria-hidden", "true");
    const corners = [["t", "l", -1, -1], ["t", "r", 1, -1], ["b", "l", -1, 1], ["b", "r", 1, 1]];
    const dots = [];
    corners.forEach(([v, h, sx, sy]) => {
      ["x", "y"].forEach((axis) => {
        const d = document.createElement("i");
        d.className = `fx-cdc-dot is-${v}${h}`;
        layer.append(d);
        dots.push({ node: d, from: axis === "x" ? { x: sx * dist, y: 0 } : { x: 0, y: sy * dist } });
      });
    });
    const rules = [];
    if (lines) {
      ["t", "b"].forEach((v) => {
        const r = document.createElement("i");
        r.className = `fx-cdc-rule is-${v}`;
        layer.append(r);
        rules.push(r);
      });
    }
    el.append(layer);
    if (reduce) return () => layer.remove();

    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      dots.forEach((d) => gsap.set(d.node, d.from));
      if (rules.length) gsap.set(rules, { scaleX: 0, transformOrigin: "0 50%" });
      const st = { trigger: el, start, end, scrub };
      gsap.to(dots.map((d) => d.node), { x: 0, y: 0, ease: "none", scrollTrigger: st });
      if (rules.length) gsap.to(rules, { scaleX: 1, ease: "none", scrollTrigger: { ...st } });
    });
    return () => { mm.revert(); layer.remove(); };
  });
})();
