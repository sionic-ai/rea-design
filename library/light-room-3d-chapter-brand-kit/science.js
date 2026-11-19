// Science & Technology — draws a molecule backdrop (hexagonal chains linked by dots, each node glowing) on a canvas, flows it with scroll and tilts it toward the cursor. The structural formula art is redrawn too.
(() => {
  window.BRAND.pages.science = (root) => {
  const C = (expr, a) => oaColor(expr, a).css;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cv = root.querySelector(".s-dots");
  const g = cv.getContext("2d");
  const stage = cv.parentElement;
  // Hex chain: node coordinates (0 to 1), ring depth (ratio to the fit-to-screen distance, toward the camera is +), and links
  const nodes = [], links = [];
  const hexAt = (cx, cy, r, z) => {
    const base = nodes.length;
    for (let i = 0; i < 6; i++) nodes.push([cx + Math.cos(Math.PI / 6 + (i * Math.PI) / 3) * r, cy + Math.sin(Math.PI / 6 + (i * Math.PI) / 3) * r * 0.7, z]);
    for (let i = 0; i < 6; i++) links.push([base + i, base + ((i + 1) % 6)]);
    return base;
  };
  const a = hexAt(0.18, 0.14, 0.09, 0.45), b = hexAt(0.34, 0.2, 0.09, 0.3), c = hexAt(0.82, 0.3, 0.1, 0.55), d = hexAt(0.66, 0.62, 0.09, 0.35), e = hexAt(0.2, 0.78, 0.1, 0.5);
  links.push([a + 0, b + 3], [b + 0, c + 3], [c + 2, d + 5], [d + 3, e + 0]);
  const DOT = C("var(--kf-on-accent)", 0.95), GLOW = [C("var(--kf-on-accent)", 1), C("var(--kf-on-accent)", 0.8), C("var(--kf-on-accent)", 0)];
  /* Cursor reaction (original kaemferolSingle) — the whole molecule scene rotates on rotation.y = _rx×.1 · rotation.x = Rotates by _ry×.05 around the world origin (screen center).
     The original molecules sit close to the camera (0~.77 of the fit-to-screen distance) so they shift a lot, give each ring of the flat image its own depth and re-shoot with 45° perspective.
     The picture when stopped (each 0) is the same as before */
  const fine = window.BRAND.pointer?.fine;
  const project = (x, y, zf, view) => {
    const { cx, cy, D, sy, cy0, sx0, cx0 } = view, Z = zf * D, k = (D - Z) / D;
    const X = (x - cx) * k, Y = -(y - cy) * k;
    const x1 = X * cx0 + Z * sx0, z1 = -X * sx0 + Z * cx0;
    const y2 = Y * cy0 - z1 * sy, z2 = Y * sy + z1 * cy0;
    const s = D / (D - z2);
    return [cx + x1 * s, cy - y2 * s, (D - Z) / (D - z2)];
  };
  let w = 0, h = 0;
  const draw = (shift, th = 0, ph = 0) => {
    if (stage.offsetWidth !== w || stage.offsetHeight !== h) { w = cv.width = stage.offsetWidth; h = cv.height = stage.offsetHeight; }
    g.clearRect(0, 0, w, h);
    const D = innerHeight / 2 / Math.tan((22.5 * Math.PI) / 180);
    const view = { cx: w / 2, cy: innerHeight / 2 - stage.getBoundingClientRect().top, D, cx0: Math.cos(th), sx0: Math.sin(th), cy0: Math.cos(ph), sy: Math.sin(ph) };
    const P = (i) => [nodes[i][0] * w, nodes[i][1] * h + shift];
    g.fillStyle = DOT;
    links.forEach(([i, j]) => {
      const [x1, y1] = P(i), [x2, y2] = P(j);
      const n = Math.max(6, Math.hypot(x2 - x1, y2 - y1) / 7);
      for (let k = 0; k <= n; k++) {
        const t = k / n;
        const [x, y, s] = project(x1 + (x2 - x1) * t + Math.sin(k * 3.1 + i) * 2, y1 + (y2 - y1) * t + Math.cos(k * 2.3 + j) * 2, nodes[i][2] + (nodes[j][2] - nodes[i][2]) * t, view);
        g.beginPath();
        g.arc(x, y, (1.6 + ((k * 7 + i) % 3) * 0.6) * s, 0, Math.PI * 2);
        g.fill();
      }
    });
    nodes.forEach((_, i) => {
      const [x0, y0] = P(i), [x, y, s] = project(x0, y0, nodes[i][2], view);
      const r = (26 + (i % 3) * 8) * s;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, GLOW[0]); gr.addColorStop(0.35, GLOW[1]); gr.addColorStop(1, GLOW[2]);
      g.fillStyle = gr;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    });
  };
  let last = null;
  const update = () => {
    const r = stage.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const shift = reduce ? 0 : Math.round(-r.top * 0.15);
    const pt = window.BRAND.pointer, th = fine ? pt._rx * 0.1 : 0, ph = fine ? pt._ry * 0.05 : 0;
    const key = th || ph ? `${shift}|${Math.round(r.top)}|${th.toFixed(4)}|${ph.toFixed(4)}` : `${shift}`;
    if (key === last) return;
    last = key;
    draw(shift, th, ph);
  };
  const onResize = () => { last = null; update(); };
  gsap.ticker.add(update);
  addEventListener("resize", onResize);
  draw(0);

  /* Structural formula: two rings and side branches — newly drawn instead of the original art */
  root.querySelectorAll(".s-struct").forEach((svg, k) => {
    const hx = (cx, cy, r = 16) => Array.from({ length: 6 }, (_, i) => `${(cx + Math.cos(Math.PI / 6 + (i * Math.PI) / 3) * r).toFixed(1)},${(cy + Math.sin(Math.PI / 6 + (i * Math.PI) / 3) * r).toFixed(1)}`).join(" ");
    svg.innerHTML = `<g fill="none" style="stroke:oklch(from var(--kf-contrast-bg) calc(l * 1.1158) 0 h)" stroke-width="1.2"><polygon points="${hx(40, 60)}"/><polygon points="${hx(68, 60)}"/><polygon points="${hx(112, 44)}"/><line x1="82" y1="52" x2="98" y2="44"/></g>` +
      `<text x="10" y="64" font-size="8">HO</text><text x="128" y="30" font-size="8">OH</text>` +
      (k === 0 ? `<g style="stroke:var(--kf-accent)" fill="none"><rect x="58" y="86" width="22" height="16"/><path d="M84 80l8 12m0-12l-8 12"/></g><text x="96" y="98" font-size="7" style="fill:var(--kf-accent)">Party</text>` : `<text x="66" y="98" font-size="8">OH</text>`);
  });
  return () => { gsap.ticker.remove(update); removeEventListener("resize", onResize); };
  };
})();
