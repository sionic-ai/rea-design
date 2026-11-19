// The original is one image per scene (isometric block, figure, mascot, cloud, plaza crowd).
// Redraw the SVG at the same position, size and composition — color is painted only by classes in index.css (--site-* · --blk).
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    parent && parent.append(n);
    return n;
  };
  const rng = (seed) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const SHIRTS = ["c-y", "c-o", "c-t", "c-b", "c-p", "c-g", "c-w", "c-n"];
  const PANTS = ["c-n", "c-b", "c-t", "c-k", "c-p"];

  /* Isometric block — a top rhombus and left · right sides, with corners rounded by thick same-color borders */
  const block = (g0, cx, cy, a, t, kind = "blk", round = 18) => {
    const g = el("g", { class: kind }, g0);
    const b = a * 0.55;
    const T = [cx, cy - b], R = [cx + a, cy], B = [cx, cy + b], L = [cx - a, cy];
    const pts = (arr) => arr.map((p) => p.join(",")).join(" ");
    const face = (cls, arr) => el("polygon", { class: cls, points: pts(arr), "stroke-width": round, "stroke-linejoin": "round" }, g);
    face("bl", [L, B, [B[0], B[1] + t], [L[0], L[1] + t]]);
    face("br", [B, R, [R[0], R[1] + t], [B[0], B[1] + t]]);
    face("bt", [T, R, B, L]);
    return { T, R, B, L, b };
  };
  const cube = (g, x, y, a = 34) => block(g, x, y, a, a * 0.9, "cube", 4);
  const cubeRow = (g, x, y, n, dx, dy, a) => { for (let i = 0; i < n; i++) cube(g, x + dx * i, y + dy * i, a); };
  const mountain = (g, x, y, w, h) => {
    el("polygon", { class: "m1", points: `${x - w / 2},${y} ${x},${y - h} ${x + w / 2},${y}` }, g);
    el("polygon", { class: "m2", points: `${x},${y - h} ${x + w / 2},${y} ${x + w * 0.1},${y}` }, g);
    el("polygon", { class: "c-w", points: `${x - w * 0.14},${y - h * 0.72} ${x},${y - h} ${x + w * 0.14},${y - h * 0.72} ${x + w * 0.05},${y - h * 0.66} ${x - w * 0.03},${y - h * 0.74}` }, g);
  };
  const cloud = (g, x, y, w) => {
    const r = w / 5;
    el("rect", { x: x - w / 2, y: y - r * 0.6, width: w, height: r * 0.9, rx: r * 0.45 }, g);
    [[-0.28, -0.25, 0.75], [0, -0.55, 1], [0.27, -0.3, 0.8]].forEach(([dx, dy, k]) => el("circle", { cx: x + dx * w, cy: y + dy * r * 1.2, r: r * k }, g));
  };
  const person = (g, x, y, s, r, opts = {}) => {
    const sh = opts.shirt || SHIRTS[Math.floor(r() * SHIRTS.length)], pa = opts.pants || PANTS[Math.floor(r() * PANTS.length)];
    const p = el("g", { transform: `translate(${x} ${y}) scale(${s})` }, g);
    el("rect", { class: pa, x: -8, y: -30, width: 6.5, height: 30, rx: 3 }, p);
    el("rect", { class: pa, x: 1.5, y: -30, width: 6.5, height: 30, rx: 3 }, p);
    if (r() > 0.55) el("path", { class: pa, d: "M-12 -30 L12 -30 L9 -48 L-9 -48 Z" }, p);
    el("rect", { class: sh, x: -11, y: -62, width: 22, height: 34, rx: 8 }, p);
    const arm = r() > 0.5 ? -1 : 1;
    el("path", { class: "ln", d: `M${-10 * arm} -56 q${-8 * arm} 10 ${-6 * arm} 22` }, p);
    el("path", { class: "ln", d: `M${10 * arm} -56 q${10 * arm} ${r() > 0.5 ? -14 : 8} ${4 * arm} ${r() > 0.5 ? -24 : 20}` }, p);
    el("circle", { class: "sk", cx: 0, cy: -72, r: 9.5 }, p);
    el("path", { class: "hr", d: r() > 0.5 ? "M-10 -72 a10 10 0 0 1 20 0 q-4 -4 -10 -3 q-6 1 -10 3z" : "M-10 -73 a10 10 0 0 1 20 0 q-10 -5 -20 0z M6 -84 a5 5 0 1 1 0.1 0z" }, p);
    return p;
  };
  const mascot = (g, x, y, s) => {
    const p = el("g", { transform: `translate(${x} ${y}) scale(${s})` }, g);
    el("line", { class: "ln2", x1: 0, y1: -118, x2: 0, y2: -132 }, p);
    el("circle", { class: "c-t", cx: 0, cy: -134, r: 5 }, p);
    el("rect", { class: "c-w ol", x: -16, y: -40, width: 32, height: 34, rx: 14 }, p);
    el("rect", { class: "c-t", x: -10, y: -30, width: 20, height: 14, rx: 6 }, p);
    el("rect", { class: "c-w ol", x: -13, y: -8, width: 9, height: 8, rx: 4 }, p);
    el("rect", { class: "c-w ol", x: 4, y: -8, width: 9, height: 8, rx: 4 }, p);
    el("circle", { class: "c-w ol", cx: 0, cy: -78, r: 40 }, p);
    el("rect", { class: "c-t", x: -28, y: -92, width: 56, height: 30, rx: 15 }, p);
    el("circle", { class: "c-w", cx: -11, cy: -77, r: 4.5 }, p);
    el("circle", { class: "c-w", cx: 11, cy: -77, r: 4.5 }, p);
    return p;
  };
  const tree = (g, x, y, s, cls) => {
    el("rect", { class: "c-k", x: x - 2 * s, y: y - 20 * s, width: 4 * s, height: 20 * s }, g);
    el("ellipse", { class: cls, cx: x, cy: y - 34 * s, rx: 22 * s, ry: 26 * s }, g);
  };
  const tablet = (g, x, y, w, h) => {
    el("rect", { class: "c-n", x, y, width: w, height: h, rx: w * 0.08 }, g);
    el("rect", { class: "c-w", x: x + w * 0.07, y: y + w * 0.07, width: w * 0.86, height: h - w * 0.14, rx: w * 0.04 }, g);
    for (let i = 0; i < 4; i++) el("rect", { class: "c-a", x: x + w * 0.16, y: y + w * 0.2 + i * h * 0.16, width: w * (0.68 - (i % 2) * 0.2), height: h * 0.06, rx: 2 }, g);
  };

  const ART = {
    mascot(svg) { mascot(svg, 60, 148, 1); },
    cloudbank(svg) { const g = el("g", {}, svg); [[90, 100, 150], [300, 70, 120], [520, 110, 170], [700, 60, 110]].forEach(([x, y, w]) => cloud(g, x, y, w)); },
    cloudbank2(svg) { const g = el("g", {}, svg); [[80, 90, 120], [260, 60, 90], [470, 100, 150]].forEach(([x, y, w]) => cloud(g, x, y, w)); },
    cloudrow(svg) { const g = el("g", {}, svg); const r = rng(5); for (let i = 0; i < 9; i++) cloud(g, 80 + i * 170 + r() * 40, 60 + r() * 120, 90 + r() * 70); },
    hero(svg) {
      const r = rng(11);
      const g = el("g", {}, svg);
      for (let i = 0; i < 6; i++) {
        const bx = -20 + i * 120 + r() * 40, bw = 90 + r() * 70, bh = 260 + r() * 260;
        el("rect", { class: "bd", x: bx, y: 520 - bh, width: bw, height: bh + 40 }, g);
        for (let k = 0; k < 14; k++) el("rect", { class: "bw", x: bx + 10 + (k % 3) * (bw / 3.4), y: 540 - bh + Math.floor(k / 3) * 34, width: bw / 5, height: 16 }, g);
      }
      el("path", { class: "gr", d: "M0 470 Q480 430 900 470 T1440 450 V900 H0Z" }, g);
      el("path", { class: "gr2", d: "M0 640 Q500 600 1000 660 T1440 640 V900 H0Z" }, g);
      for (let i = 0; i < 18; i++) tree(g, r() * 1440, 470 + r() * 60, 1 + r() * 1.4, r() > 0.5 ? "tg1" : "tg2");
      const people = [];
      for (let i = 0; i < 46; i++) { const y = 520 + r() * 400; people.push([r() * 1440, y]); }
      people.sort((a, b) => a[1] - b[1]).forEach(([x, y]) => person(g, x, y, 0.9 + ((y - 520) / 400) * 2.4, r));
    },
    intro(svg) {
      const g = el("g", {}, svg);
      block(g, 1080, 640, 300, 120, "bt-o");
      block(g, 1280, 560, 220, 300, "bt-p");
      block(g, 900, 720, 220, 90, "bt-y");
      block(g, 1180, 820, 260, 80, "bt-t");
      cubeRow(g, 760, 520, 5, 40, -22, 26);
      const word = el("text", { class: "word3d", x: 1000, y: 470, "font-size": 230 }, g);
      word.textContent = "Brand";
      const word2 = el("text", { class: "word3d-top", x: 990, y: 460, "font-size": 230 }, g);
      word2.textContent = "Brand";
      const r = rng(3);
      [[860, 690], [1010, 610], [1160, 520], [1320, 400], [960, 800], [1240, 780]].forEach(([x, y]) => person(g, x, y, 1.1, r));
      mascot(g, 1380, 390, 0.6);
      el("circle", { class: "c-w ol", cx: 1150, cy: 690, r: 34 }, g);
      el("path", { class: "ln2", d: "M1150 668 V690 L1166 700" }, g);
    },
    block(svg) {
      const shape = svg.dataset.shape;
      const g = el("g", {}, svg);
      const r = rng(shape.length * 7 + 1);
      if (shape === "flat") {
        cubeRow(g, 120, 640, 4, 70, -14, 36);
        block(g, 1020, 450, 760, 62);
        cubeRow(g, 1700, 720, 4, 80, 10, 36);
      } else if (shape === "tall") {
        block(g, 980, 330, 720, 380);
        mountain(g, 1360, 900, 340, 260);
        mountain(g, 1600, 900, 260, 180);
        cubeRow(g, 1500, 520, 5, 80, -20, 32);
        cube(g, 300, 760, 70);
      } else if (shape === "tower") {
        block(g, 1450, -60, 820, 980);
        mountain(g, 700, 380, 300, 220);
        for (let i = 0; i < 9; i++) cube(g, 820 + i * 46, 620 + i * 24, 28);
        cubeRow(g, 200, 520, 3, 70, -12, 30);
      } else {
        block(g, 760, -40, 760, 1000);
        for (let i = 0; i < 8; i++) cube(g, 380 + i * 50, 700 + i * 22, 26);
      }
      for (let i = 0; i < 2; i++) person(g, 400 + r() * 1200, 420 + r() * 120, 1.2, r);
    },
    duo(svg) { const r = rng(2); person(svg, 50, 190, 1.7, r, { shirt: "c-w", pants: "c-p" }); mascot(svg, 120, 196, 0.62); el("path", { class: "ln2", d: "M140 70 v-40 l26 8 -26 8" }, svg); },
    clock(svg) { el("circle", { class: "c-w ol", cx: 50, cy: 66, r: 40 }, svg); el("path", { class: "ln2", d: "M50 40 V66 L68 76" }, svg); el("rect", { class: "c-p", x: 40, y: 14, width: 20, height: 10, rx: 3 }, svg); },
    desk(svg) { const r = rng(9); tablet(svg, 20, 70, 110, 80); tablet(svg, 150, 40, 90, 120); person(svg, 260, 196, 1.6, r); },
    talk(svg) { const r = rng(4); person(svg, 60, 214, 2, r, { shirt: "c-b", pants: "c-n" }); person(svg, 140, 214, 1.8, r, { shirt: "c-w", pants: "c-p" }); el("rect", { class: "c-o", x: 70, y: 20, width: 60, height: 36, rx: 8 }, svg); el("rect", { class: "c-y", x: 110, y: 50, width: 50, height: 30, rx: 8 }, svg); },
    cubes(svg) { cubeRow(svg, 50, 110, 4, 72, 6, 34); },
    reader(svg) { const r = rng(6); tablet(svg, 40, 40, 100, 140); person(svg, 200, 196, 1.9, r, { shirt: "c-w" }); [[150, 40], [230, 30], [90, 20]].forEach(([x, y]) => el("circle", { class: "c-w ol", cx: x, cy: y, r: 16 }, svg)); },
    ladder(svg) { el("path", { class: "ld", d: "M40 250 L90 20 M90 250 L140 20" }, svg); for (let i = 0; i < 9; i++) el("line", { class: "ld", x1: 44 + i * 5.2, y1: 232 - i * 24, x2: 94 + i * 5.2, y2: 232 - i * 24 }, svg); const r = rng(8); person(svg, 96, 160, 1.3, r, { shirt: "c-w", pants: "c-p" }); mascot(svg, 112, 82, 0.4); },
    clockbig(svg) { el("circle", { class: "c-w ol", cx: 150, cy: 80, r: 58 }, svg); el("circle", { class: "c-p", cx: 150, cy: 80, r: 50 }, svg); el("circle", { class: "c-w", cx: 150, cy: 80, r: 44 }, svg); el("path", { class: "ln2", d: "M150 46 V80 L176 92" }, svg); el("rect", { class: "c-w ol", x: 30, y: 60, width: 70, height: 40, rx: 6 }, svg); },
    person(svg) { person(svg, 40, 158, 1.9, rng(svg.closest("section").dataset.scene * 13 + 1)); },
    stairs(svg) { for (let i = 0; i < 8; i++) { el("polygon", { class: "c-w ol", points: `${30 + i * 30},${230 - i * 26} ${70 + i * 30},${210 - i * 26} ${110 + i * 30},${230 - i * 26} ${70 + i * 30},${250 - i * 26}` }, svg); } const r = rng(12); person(svg, 120, 190, 1, r); person(svg, 210, 110, 1, r); },
    blob(svg) {
      el("path", { class: "c-y", d: "M80 120 C60 40 200 10 300 40 C390 10 560 20 590 120 C630 220 560 260 590 340 C620 430 480 460 400 420 C330 460 200 470 150 410 C70 440 10 360 40 290 C0 220 60 180 80 120Z" }, svg);
      const r = rng(21);
      [[150, 380], [230, 360], [320, 390], [410, 360], [500, 380]].forEach(([x, y], i) => person(svg, x, y + 40, 2.6, r, { shirt: SHIRTS[i + 1] }));
      for (let i = 0; i < 14; i++) { const x = 60 + r() * 500, y = 60 + r() * 360; el("path", { class: "c-w", d: `M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2}Z` }, svg); }
    },
    crowd(svg) {
      const r = rng(31);
      const g = el("g", {}, svg);
      for (let i = 0; i < 7; i++) tree(g, 520 + r() * 460, 260, 1.6 + r(), r() > 0.5 ? "tg1" : "tg2");
      for (let i = 0; i < 10; i++) person(g, 60 + r() * 380, 230 + r() * 60, 2 + r() * 0.6, r);
      for (let i = 0; i < 10; i++) person(g, 1040 + r() * 420, 230 + r() * 60, 2 + r() * 0.6, r);
      mascot(g, 750, 300, 0.4);
    },
  };

  document.querySelectorAll("svg[data-art]").forEach((svg) => { const f = ART[svg.dataset.art]; f && f(svg); });

  /* Coarse grain texture over each scene — spot for the original texture image */
  let gid = 0;
  document.querySelectorAll("[data-art-texture]").forEach((box) => {
    const id = `tf-grain-${gid++}`;
    box.innerHTML = `<svg viewBox="0 0 400 400" preserveAspectRatio="none" aria-hidden="true"><filter id="${id}"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="${gid}"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2 1.2"/></filter><rect width="400" height="400" filter="url(#${id})"/></svg>`;
  });
})();
