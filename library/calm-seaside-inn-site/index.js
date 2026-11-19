// Map drawing — the original image isn’t used, the same position, size and texture (fine-lined island map of layered contours + dots and place names) are redrawn with seeded fixed random numbers.
// Lines and text use currentColor and the ground uses the background color, so swapping skin changes them together
(() => {
  const W = 950, H = 630;
  const f = (n) => Math.round(n * 10) / 10;
  const smooth = (pts) => {
    const n = pts.length, at = (i) => pts[(i + n) % n];
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let i = 0; i < n; i++) {
      const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
      d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
    }
    return d + "Z";
  };
  const make = (seed0, opt) => {
    let seed = seed0;
    const rnd = () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const r = (a, b) => a + (b - a) * rnd();
    // Island placement — place big islands first, re-pick if they overlap
    const isles = [];
    for (const [n, r0, r1] of opt.sizes) {
      for (let k = 0, tries = 0; k < n && tries < 400; tries++) {
        const R = r(r0, r1), cx = r(opt.box[0] + R, opt.box[2] - R), cy = r(opt.box[1] + R, opt.box[3] - R);
        if (isles.some((o) => Math.hypot(o.cx - cx, o.cy - cy) < (o.R + R) * 1.12)) continue;
        isles.push({ cx, cy, R, h: [r(0, 6), r(0, 6), r(0, 6), r(0, 6), r(0, 6), r(0, 6)], a: [r(0.12, 0.28), r(0.06, 0.16), r(0.03, 0.08), r(0.02, 0.05), r(0.015, 0.035), r(0.01, 0.025)] });
        k++;
      }
    }
    // Contour lines — the same shape shrunk inward layer upon layer, the top slightly offset
    const ring = (o, s) => {
      const pts = [], N = Math.max(16, Math.round(o.R * s * 1.1));
      const ox = o.R * (1 - s) * 0.25, oy = -o.R * (1 - s) * 0.18;
      for (let i = 0; i < N; i++) {
        const t = (i / N) * Math.PI * 2;
        const k = 1 + o.a[0] * Math.sin(2 * t + o.h[0]) + o.a[1] * Math.sin(3 * t + o.h[1]) + o.a[2] * Math.sin(5 * t + o.h[2]) + o.a[3] * Math.sin(9 * t + o.h[3]) + o.a[4] * Math.sin(14 * t + o.h[4]) * s + o.a[5] * Math.sin(23 * t + o.h[5]) * s;
        pts.push([o.cx + ox + Math.cos(t) * o.R * s * k, o.cy + oy + Math.sin(t) * o.R * s * k * 0.86]);
      }
      return smooth(pts);
    };
    let land = "", coast = "", inner = "", sea = "";
    isles.forEach((o) => {
      land += ring(o, 1);
      coast += ring(o, 1);
      sea += o.R > 26 ? ring(o, 1.12) : "";
      for (const s of [0.8, 0.62, 0.46, 0.32, 0.2]) if (o.R * s > 5) inner += ring(o, s);
    });
    // Place names — dots and names around the big island, the lodging spot gets a bold label
    const big = [...isles].sort((a, b) => b.R - a.R);
    let marks = "", texts = "";
    big.slice(0, opt.labels).forEach((o, i) => {
      const t = r(0, Math.PI * 2), x = o.cx + Math.cos(t) * o.R * 0.45, y = o.cy + Math.sin(t) * o.R * 0.35;
      marks += `M${f(x)} ${f(y)}m-2.2 0a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0-4.4 0`;
      texts += `<text class="t-map-text" x="${f(x + 6)}" y="${f(y + 3.5)}">Place ${i + 1}</text>`;
    });
    const home = big[0];
    const hx = home.cx - home.R * 0.2, hy = home.cy + home.R * 0.1;
    texts += `<text class="t-map-text" x="${f(hx - 80)}" y="${f(hy - 56)}" font-size="16" letter-spacing="4">LOGO</text>`;
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
      <path class="t-map-line" stroke-width=".5" stroke-dasharray="2 3" d="${sea}"/>
      <path class="t-map-land" d="${land}"/>
      <path class="t-map-line" stroke-width=".55" d="${inner}"/>
      <path class="t-map-line" stroke-width="1" d="${coast}"/>
      <path class="t-map-line" stroke-width=".8" d="M${f(hx)} ${f(hy)}L${f(hx - 24)} ${f(hy - 40)}H${f(hx - 82)}"/>
      <path class="t-map-dot" d="${marks}M${f(hx)} ${f(hy)}m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0"/>
      ${texts}
    </svg>`;
  };
  const MAPS = {
    wide: { sizes: [[2, 70, 95], [5, 30, 52], [12, 10, 24], [26, 3, 8]], box: [150, 40, 820, 600], labels: 9 },
    near: { sizes: [[1, 150, 175], [3, 50, 80], [8, 14, 30], [18, 4, 9]], box: [60, 30, 900, 610], labels: 6 },
  };
  document.querySelectorAll("[data-map]").forEach((el, i) => {
    const key = el.dataset.map in MAPS ? el.dataset.map : "wide";
    el.innerHTML = make(key === "wide" ? 21 : 5, MAPS[key]);
  });
})();
