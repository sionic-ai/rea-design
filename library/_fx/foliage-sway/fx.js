(() => {
  // If a picture slot in a bouquet is empty, draws round-leaf sprigs (eucalyptus type), yellow buds and white flowers in SVG — the same key always yields the same type (fixed seed)
  const KEYS = {
    "branch-2": { w: 274, h: 1031, n: 14, r: 0.17, bend: [0.62, 0.38, 0.6, 0.42], seed: 7 },
    "branch-1": { w: 265, h: 622, n: 7, r: 0.17, bend: [0.5, 0.62, 0.4, 0.55], seed: 3, buds: 9 },
    "branch-3": { w: 274, h: 469, n: 5, r: 0.16, bend: [0.42, 0.5, 0.58, 0.5], seed: 11, flowers: 2 },
    "leaf-2": { w: 132, h: 265, n: 5, r: 0.26, bend: [0.2, 0.35, 0.6, 0.75], seed: 5 },
    "leaf-3": { w: 132, h: 265, n: 4, r: 0.28, bend: [0.25, 0.3, 0.55, 0.8], seed: 13 },
    "leaf-4": { w: 127, h: 265, n: 5, r: 0.26, bend: [0.8, 0.65, 0.4, 0.25], seed: 17 },
  };
  const ORDER = ["leaf-2", "leaf-3", "branch-1", "branch-2", "branch-3", "leaf-4"];
  const rng = (s) => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const bez = (p, t) => {
    const u = 1 - t;
    return [0, 1].map((k) => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k]);
  };
  const f = (n) => Math.round(n * 10) / 10;
  const leaf = (x, y, deg, r, deep) =>
    `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(deg)})"><path class="fx-fs-leaf${deep ? " is-deep" : ""}" d="M0 0C${f(r * 0.95)} ${f(-r * 0.2)} ${f(r)} ${f(-r * 1.55)} 0 ${f(-r * 1.95)}C${f(-r)} ${f(-r * 1.55)} ${f(-r * 0.95)} ${f(-r * 0.2)} 0 0Z"/><path class="fx-fs-vein" stroke-width="${f(Math.max(0.6, r * 0.04))}" d="M0 ${f(-r * 0.15)}L0 ${f(-r * 1.6)}"/></g>`;
  const flower = (x, y, r, rot) => {
    let s = `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})">`;
    for (let i = 0; i < 5; i++) s += `<ellipse class="fx-fs-petal" cx="0" cy="${f(-r * 0.62)}" rx="${f(r * 0.42)}" ry="${f(r * 0.66)}" transform="rotate(${i * 72})"/>`;
    return s + `<circle class="fx-fs-heart" r="${f(r * 0.16)}"/></g>`;
  };
  function draw(key) {
    const k = KEYS[key];
    if (!k) return "";
    const rand = rng(k.seed);
    const { w, h } = k;
    const pts = [[w * k.bend[0], h], [w * k.bend[1], h * 0.66], [w * k.bend[2], h * 0.34], [w * k.bend[3], h * 0.05]];
    const sw = Math.max(1.2, w * 0.012);
    let out = `<path class="fx-fs-stem" stroke-width="${f(sw)}" d="M${f(pts[0][0])} ${f(pts[0][1])}C${f(pts[1][0])} ${f(pts[1][1])} ${f(pts[2][0])} ${f(pts[2][1])} ${f(pts[3][0])} ${f(pts[3][1])}"/>`;
    for (let i = 0; i < k.n; i++) {
      const t = 0.1 + (0.86 * i) / Math.max(1, k.n - 1);
      const [x, y] = bez(pts, t);
      const [x2, y2] = bez(pts, Math.min(1, t + 0.01));
      const along = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI + 90;
      const side = i % 2 ? 1 : -1;
      const r = w * k.r * (1 - 0.42 * t) * (0.85 + rand() * 0.3);
      out += leaf(x, y, along + side * (38 + rand() * 24), r, (i + k.seed) % 3 === 0);
    }
    if (k.buds) {
      const [tx, ty] = pts[3];
      for (let i = 0; i < k.buds; i++) {
        const a = rand() * Math.PI * 2, d = w * (0.05 + rand() * 0.16);
        out += `<circle class="fx-fs-bud" cx="${f(tx + Math.cos(a) * d)}" cy="${f(ty + h * 0.08 + Math.sin(a) * d)}" r="${f(w * (0.025 + rand() * 0.02))}"/>`;
      }
    }
    if (k.flowers) {
      const [tx, ty] = bez(pts, 0.9);
      out += flower(tx - w * 0.12, ty + h * 0.04, w * 0.2, rand() * 60);
      out += flower(tx + w * 0.16, ty + h * 0.16, w * 0.15, rand() * 60);
    }
    return `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true">${out}</svg>`;
  }

  kfFx.register("foliage-sway", (el) => {
    const made = [];
    let parts = [...el.querySelectorAll(':scope > [data-fx-part="sway"]')];
    if (!parts.length) {
      ORDER.forEach((key) => {
        const s = document.createElement("span");
        s.setAttribute("data-fx-part", "sway");
        s.dataset.key = key;
        el.append(s);
        made.push(s);
      });
      parts = made;
    }
    const filled = [];
    parts.forEach((p) => {
      if (p.children.length || !KEYS[p.dataset.key]) return;
      p.innerHTML = draw(p.dataset.key);
      filled.push(p);
    });
    return () => {
      made.forEach((s) => s.remove());
      filled.forEach((p) => p.isConnected && (p.innerHTML = ""));
    };
  });
})();
