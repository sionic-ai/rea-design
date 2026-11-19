// Hero pen drawing — the original art is not used, a ”tree hollow with stairs and a house” of the same spot, size and texture (fine pen lines and hatching) is redrawn with seed-fixed random numbers.
// The stem is painted in the background color to hide the middle of the title behind it, and the line is currentColor so it changes along with the skin.
(() => {
  const host = document.querySelector("[data-tree]");
  if (!host) return;

  let seed = 11;
  const rnd = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const r = (a, b) => a + (b - a) * rnd();
  const f = (n) => Math.round(n * 10) / 10;

  // A smooth curve through the points (Catmull-Rom → cubic Bezier)
  const smooth = (pts, close) => {
    const n = pts.length;
    const at = (i) => (close ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let i = 0; i < (close ? n : n - 1); i++) {
      const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
      d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
    }
    return close ? d + "Z" : d;
  };
  const line = (pts) => "M" + pts.map((p) => `${f(p[0])} ${f(p[1])}`).join("L");

  const LEFT = [[10, 750], [60, 730], [80, 690], [84, 620], [74, 540], [70, 450], [76, 360], [66, 280], [46, 215], [32, 168]];
  const RIGHT = [[468, 168], [454, 215], [434, 280], [424, 360], [430, 450], [426, 540], [416, 620], [420, 690], [440, 730], [490, 750]];
  const TRUNK = [...LEFT, [44, 128], [78, 96], [124, 100], [176, 150], [250, 176], [324, 150], [376, 100], [422, 96], [456, 128], ...RIGHT, [380, 754], [250, 756], [120, 754]];
  const edgeX = (side, y) => {
    for (let i = 0; i < side.length - 1; i++) {
      const [x1, y1] = side[i], [x2, y2] = side[i + 1];
      if ((y - y1) * (y - y2) <= 0 && y1 !== y2) return x1 + ((x2 - x1) * (y - y1)) / (y2 - y1);
    }
    return null;
  };
  const H = { cx: 250, cy: 410, rx: 95, ry: 220 };
  const halfW = (y) => H.rx * Math.sqrt(Math.max(0, 1 - ((y - H.cy) / H.ry) ** 2));

  const ink = [], fine = [], solid = [], paper = [];

  // Hatched shadow at the feet: darkest under the stem, fading to both sides
  ink.push(smooth([[-30, 752], [80, 749], [250, 751], [420, 748], [530, 752]]));
  for (let i = 0; i < 300; i++) {
    const x = r(-20, 520), k = Math.max(0, 1 - Math.abs(x - 250) / 270);
    const len = 48 * k ** 1.3 * r(0.5, 1);
    if (len > 2) fine.push(line([[x, 752], [x + r(-1, 1), 752 + len]]));
  }
  // Root
  [[[14, 748], [-10, 758], [-34, 762]], [[60, 744], [40, 760], [24, 772]], [[486, 748], [508, 757], [532, 760]], [[440, 744], [462, 762], [470, 776]]].forEach((p) => ink.push(smooth(p)));

  // Trunk bark grain — clipped to the trunk shape, with more hatching toward the edges so it reads as a round mass
  const bark = [];
  for (let x = 4; x <= 496; x += r(4, 6.5)) {
    const pts = [];
    const ph = r(0, 6), amp = r(1, 3.2);
    for (let y = 760; y >= 84; y -= 18) pts.push([x + Math.sin(y / 60 + ph) * amp + r(-0.8, 0.8), y]);
    bark.push(smooth(pts));
  }
  for (let y = 190; y < 745; y += r(3.5, 6)) {
    const l = edgeX(LEFT, y), rr = edgeX(RIGHT, y);
    if (l != null) bark.push(line([[l, y], [l + r(8, 26), y + r(1, 4)]]));
    if (rr != null) bark.push(line([[rr, y], [rr - r(6, 18), y + r(1, 4)]]));
  }

  // Hole — painted in the background color, with shaded hatching on the inner left border
  const hole = [];
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 14) hole.push([H.cx + Math.cos(a) * H.rx * r(0.97, 1.03), H.cy + Math.sin(a) * H.ry * r(0.985, 1.015)]);
  const holeD = smooth(hole, true);
  const rim = [];
  for (let a = Math.PI * 0.45; a < Math.PI * 1.6; a += 0.035) {
    const x = H.cx + Math.cos(a) * H.rx, y = H.cy + Math.sin(a) * H.ry, k = r(6, 18);
    rim.push(line([[x, y], [x + k * 0.9, y + r(-2, 2)]]));
  }

  // Stairs inside the hole — steps climbing and turning from bottom to top, a floor plate on each level, small windows in the wall
  const stair = [];
  let side = 0;
  for (let y = 612; y > 236; y -= 47) {
    const y2 = y - 47, w1 = halfW(y) - 14, w2 = halfW(y2) - 14;
    const xa = side ? H.cx + w1 : H.cx - w1, xb = side ? H.cx - w2 : H.cx + w2;
    stair.push(line([[H.cx - halfW(y) + 2, y], [H.cx + halfW(y) - 2, y]]), line([[H.cx - halfW(y) + 2, y + 4], [H.cx + halfW(y) - 2, y + 4]]));
    stair.push(line([[xa, y], [xb, y2]]), line([[xa, y + 5], [xb, y2 + 5]]));
    const steps = 9;
    for (let s = 1; s < steps; s++) {
      const t = s / steps, x = xa + (xb - xa) * t, yy = y + (y2 - y) * t;
      stair.push(line([[x, yy], [x, yy - 47 / steps]]));
    }
    side ^= 1;
  }
  [[H.cx - 70, 300], [H.cx + 58, 360], [H.cx - 74, 520], [H.cx + 62, 560]].forEach(([x, y]) => {
    paper.push(`M${x} ${y}h12v16h-12z`);
    stair.push(`M${x} ${y}h12v16h-12zM${x + 6} ${y}v16M${x} ${y + 8}h12`);
  });

  // Branch — from two forked stems to a leaf clump
  const branches = [
    [[52, 200], [26, 160], [6, 120], [-6, 96]], [[80, 160], [96, 116], [100, 74]], [[140, 166], [168, 120], [196, 92]],
    [[448, 200], [474, 158], [500, 130]], [[420, 158], [400, 110], [372, 74]], [[350, 168], [320, 120], [300, 96]],
    [[74, 330], [36, 318], [-4, 300]], [[428, 290], [470, 270], [512, 262]],
  ];
  const twig = [];
  branches.forEach((b) => {
    twig.push(smooth(b), smooth(b.map(([x, y], i) => [x + (i ? 3 : 7), y + (i ? 2 : 5)])));
  });

  // Leaf — stack small puffy clumps from top to bottom so the front ones cover those behind
  const puff = (x, y, rad) => {
    const n = 7 + Math.floor(rnd() * 3), a0 = r(0, Math.PI);
    let d = "";
    for (let i = 0; i <= n; i++) {
      const a = a0 + (i / n) * Math.PI * 2, am = a0 + ((i - 0.5) / n) * Math.PI * 2;
      const px = x + Math.cos(a) * rad, py = y + Math.sin(a) * rad;
      if (!i) d += `M${f(px)} ${f(py)}`;
      else d += `Q${f(x + Math.cos(am) * rad * 1.38)} ${f(y + Math.sin(am) * rad * 1.38)} ${f(px)} ${f(py)}`;
    }
    return d + "Z";
  };
  const leaves = [];
  const cloud = (cx, cy, rx, ry, n, s0, s1) => {
    for (let i = 0; i < n; i++) {
      const a = r(0, Math.PI * 2), k = Math.sqrt(rnd());
      leaves.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k, r(s0, s1)]);
    }
  };
  cloud(250, 100, 240, 84, 250, 7, 13);
  cloud(130, 70, 90, 50, 50, 6, 11);
  cloud(370, 62, 80, 44, 44, 6, 11);
  cloud(-8, 296, 48, 30, 30, 5, 10);
  cloud(508, 258, 44, 28, 28, 5, 10);
  leaves.sort((a, b) => a[1] - b[1]);
  const leafPaths = leaves.map(([x, y, s]) => `<path class="u-tree__paper u-tree__ink" stroke-width=".8" d="${puff(x, y, s)}"/>`).join("");
  const leafTicks = leaves.filter(() => rnd() < 0.45).map(([x, y, s]) => line([[x - s * 0.3, y + s * 0.1], [x + s * 0.2, y - s * 0.25]])).join("");

  // Small houses and balconies attached outside — roof slope, window grid
  const house = (x, y, w, h, roof) => {
    paper.push(`M${x} ${y}h${w}v${h}h${-w}z` + (roof ? `M${x - 4} ${y}L${x + w / 2} ${y - roof}L${x + w + 4} ${y}z` : ""));
    let d = `M${x} ${y}h${w}v${h}h${-w}z` + (roof ? `M${x - 4} ${y}L${x + w / 2} ${y - roof}L${x + w + 4} ${y}z` : `M${x - 5} ${y}h${w + 10}`);
    const cols = Math.max(2, Math.round(w / 16)), rows = Math.max(1, Math.round(h / 20));
    for (let c = 0; c < cols; c++) for (let rr = 0; rr < rows; rr++) {
      const wx = x + 5 + c * ((w - 10) / cols), wy = y + 6 + rr * ((h - 10) / rows), ww = (w - 10) / cols - 4, wh = (h - 10) / rows - 5;
      d += `M${f(wx)} ${f(wy)}h${f(ww)}v${f(wh)}h${f(-ww)}zM${f(wx + ww / 2)} ${f(wy)}v${f(wh)}`;
    }
    return d;
  };
  const balcony = (x1, x2, y) => {
    let d = `M${x1} ${y}H${x2}M${x1} ${y - 11}H${x2}M${x1} ${y + 3}H${x2}`;
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x += 4.5) d += `M${f(x)} ${y - 11}V${y}`;
    return d;
  };
  const build = [
    house(12, 296, 60, 44, 20), house(428, 378, 56, 46, 0), house(146, 70, 36, 30, 16), house(306, 44, 34, 28, 14),
    house(96, 600, 34, 30, 0), house(372, 640, 40, 34, 14),
    balcony(76, 26, 470), balcony(424, 476, 520), balcony(84, 40, 646),
  ];
  // Outer stairs connecting the houses
  for (let s = 0; s < 10; s++) build.push(`M${f(20 + s * 5)} ${f(466 - s * 12)}h5v-12`);
  [[96, 412], [404, 300], [392, 566], [110, 520]].forEach(([x, y]) => {
    paper.push(`M${x} ${y}h14v18h-14z`);
    build.push(`M${x} ${y}h14v18h-14zM${x + 7} ${y}v18M${x} ${y + 9}h14`);
  });

  const birds = [line([[318, 18], [324, 23], [331, 16]]), line([[340, 8], [345, 12], [351, 6]])];
  [[262, 230], [238, 236]].forEach(([x, y]) => solid.push(`M${x} ${y}m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0`));

  const id = "u-trunk-" + Math.round(rnd() * 1e6);
  host.innerHTML = `<svg viewBox="-40 0 580 800" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
    <defs><clipPath id="${id}"><path d="${smooth(TRUNK, true)}"/></clipPath></defs>
    <path class="u-tree__ink" stroke-width=".7" d="${fine.join("")}"/>
    <path class="u-tree__ink" stroke-width="1.1" d="${ink.join("")}"/>
    <path class="u-tree__ink" stroke-width="1.6" d="${twig.join("")}"/>
    <path class="u-tree__paper u-tree__ink" stroke-width="1.5" d="${smooth(TRUNK, true)}"/>
    <g clip-path="url(#${id})"><path class="u-tree__ink" stroke-width=".7" d="${bark.join("")}"/></g>
    <path class="u-tree__paper u-tree__ink" stroke-width="1.4" d="${holeD}"/>
    <path class="u-tree__ink" stroke-width=".6" d="${rim.join("")}"/>
    ${leafPaths}
    <path class="u-tree__ink" stroke-width=".6" d="${leafTicks}"/>
    <path class="u-tree__paper" d="${paper.join("")}"/>
    <path class="u-tree__ink" stroke-width=".9" d="${stair.join("")}${build.join("")}"/>
    <path class="u-tree__ink" stroke-width=".9" d="${birds.join("")}"/>
    <path class="u-tree__solid" d="${solid.join("")}"/>
  </svg>`;
})();
