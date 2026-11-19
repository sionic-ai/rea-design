// First page — pictures (bench letters · map · isometric drawing) are redrawn here as SVG, and the spec · combo sliders are hung with the same Swiper 11.2.5 as the original
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const S = (tag, attrs = {}, parent) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  };
  const H = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const PEOPLE = ["var(--site-blue)", "var(--site-orange)", "var(--kf-ink-soft)", "var(--site-sage)", "var(--site-pink)"];

  /* ── One bench segment: shadow → wooden seat (three planks) → gray supports at both ends and bends → planter */
  function benchChain(g, pts, o) {
    const w = o.w, cap = o.cap, closed = !!o.closed;
    const segs = [];
    const n = pts.length;
    for (let i = 0; i < (closed ? n : n - 1); i++) segs.push([pts[i], pts[(i + 1) % n]]);
    const shadow = S("g", {}, g), wood = S("g", {}, g), blocks = S("g", {}, g);
    segs.forEach(([a, b]) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
      const ax = a[0] + ux * cap, ay = a[1] + uy * cap, bx = b[0] - ux * cap, by = b[1] - uy * cap;
      S("line", { x1: ax + o.sh, y1: ay + o.sh * 1.3, x2: bx + o.sh, y2: by + o.sh * 1.3, "stroke-width": w + 4, class: "cb-bench__shadow" }, shadow);
      S("line", { x1: ax, y1: ay, x2: bx, y2: by, "stroke-width": w, class: "cb-bench__wood" }, wood);
      [-w / 3.2, 0, w / 3.2].forEach((off) => {
        S("line", { x1: ax - uy * off, y1: ay + ux * off, x2: bx - uy * off, y2: by + ux * off, "stroke-width": Math.max(1, w / 26), class: "cb-bench__plank" }, wood);
      });
    });
    const joint = (p, ang, end) => {
      const gg = S("g", { transform: `translate(${p[0]} ${p[1]}) rotate(${ang})` }, blocks);
      if (end) {
        S("polygon", { points: `${-cap * 0.2},${-w * 0.62} ${cap * 1.05},${-w * 0.62} ${cap * 1.05},${w * 0.62} ${-cap * 0.2},${w * 0.62}`, class: "cb-bench__block" }, gg);
      } else {
        const r = w * 0.72;
        S("polygon", { points: [0, 60, 120, 180, 240, 300].map((d) => `${(r * Math.cos(d * Math.PI / 180)).toFixed(1)},${(r * Math.sin(d * Math.PI / 180)).toFixed(1)}`).join(" "), class: "cb-bench__block" }, gg);
      }
    };
    pts.forEach((p, i) => {
      const isEnd = !closed && (i === 0 || i === n - 1);
      const q = isEnd ? (i === 0 ? pts[1] : pts[n - 2]) : pts[(i + 1) % n];
      let ang = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI;
      joint(p, ang, isEnd);
    });
    (o.planters || []).forEach((p) => planter(g, p, w * 1.25));
  }
  function planter(g, p, s) {
    const gg = S("g", { transform: `translate(${p[0]} ${p[1]})` }, g);
    S("rect", { x: -s / 2, y: -s / 2, width: s, height: s, class: "cb-planter" }, gg);
    [[-s * 0.16, -s * 0.12, s * 0.3, ""], [s * 0.16, -s * 0.05, s * 0.27, " is-dark"], [-s * 0.02, s * 0.17, s * 0.28, ""], [s * 0.04, -s * 0.2, s * 0.2, " is-dark"]].forEach(([x, y, r, c]) => {
      S("circle", { cx: x, cy: y, r, class: "cb-planter__leaf" + c }, gg);
    });
  }
  // Person seen from above: shoulder ellipse + arms + head
  function topPerson(g, x, y, ang, c, s = 1) {
    const gg = S("g", { transform: `translate(${x} ${y}) rotate(${ang}) scale(${s})`, style: `--c: ${c}` }, g);
    S("line", { x1: -16, y1: 4, x2: -20, y2: 20, "stroke-width": 6, "stroke-linecap": "round", class: "cb-person__arm" }, gg);
    S("line", { x1: 16, y1: 4, x2: 22, y2: 18, "stroke-width": 6, "stroke-linecap": "round", class: "cb-person__arm" }, gg);
    S("ellipse", { cx: 0, cy: 0, rx: 19, ry: 11, class: "cb-person__body" }, gg);
    S("circle", { cx: 0, cy: -2, r: 8.5, class: "cb-person__head" }, gg);
  }

  /* Hero text — each cell is one source image (half row of 1903 wide × 1249 tall) */
  const LETTERS = {
    c1: { chains: [{ pts: [[456, 107], [222, 107], [88, 299], [222, 499], [456, 499]] }], people: [[241, 116, 10], [168, 410, 120]] },
    o: { chains: [{ pts: [[195, 107], [410, 107], [522, 299], [410, 491], [195, 491], [55, 299]], closed: true }], people: [[485, 219, -60]] },
    n: { chains: [{ pts: [[82, 239], [250, 71], [419, 249], [577, 90]], planters: [[250, 71], [419, 249]] }, { pts: [[82, 444], [250, 276], [419, 454], [577, 295]], planters: [[250, 276], [419, 454]] }], people: [[316, 165, 40]] },
    e: { chains: [{ pts: [[300, 105], [82, 105], [82, 480], [300, 480]], planters: [[82, 105], [82, 480]] }, { pts: [[82, 290], [270, 290]], planters: [[82, 290], [270, 290]] }], people: [[191, 118, 0]] },
    c2: { chains: [{ pts: [[384, 84], [150, 84], [38, 277], [150, 470], [384, 470]] }], people: [[94, 314, 60], [150, 395, 30]] },
    t: { chains: [{ pts: [[51, 105], [397, 105]] }, { pts: [[229, 105], [229, 520]], planters: [[229, 105], [229, 300], [229, 480]] }], people: [[313, 69, 180]] },
  };
  document.querySelectorAll(".cb-letter").forEach((svg, li) => {
    const d = LETTERS[svg.dataset.letter];
    if (!d) return;
    const glyph = S("g", { class: "cb-letter__glyph" }, svg);
    d.chains.forEach((c) => benchChain(glyph, c.pts, { w: 44, cap: 30, sh: 9, closed: c.closed, planters: c.planters }));
    const people = S("g", { class: "cb-letter__people" }, svg);
    d.people.forEach(([x, y, a], i) => topPerson(people, x, y, a, PEOPLE[(li + i) % PEOPLE.length], 1.35));
  });

  // Letter plate size: fit 1903:1249 into the cell left after subtracting the left/right and top/bottom margins from the plate (original numbers)
  const kv = document.querySelector(".cb-kv"), kvWrap = document.querySelector(".cb-kv__wrap");
  const fitKv = () => {
    if (!kv || !kvWrap) return;
    let padX = 236, padY = 116;
    if (innerWidth <= 1024 && innerWidth >= 768) { padX = 100; padY = 100; } else if (innerWidth <= 767) { padX = 20; padY = 100; }
    const r = kv.clientWidth - padX, n = kv.clientHeight - padY, ratio = 1903 / 1249;
    let w = r, h = w / ratio;
    if (h > n) { h = n; w = h * ratio; }
    kvWrap.style.width = `${w}px`;
    kvWrap.style.height = `${h}px`;
  };
  fitKv();
  addEventListener("load", fitKv);
  addEventListener("resize", fitKv);

  /* ── Story map: clusters of benches·trees·buildings around a road, with three crowds of people over it */
  function tree(g, x, y, s, light) {
    S("line", { x1: x, y1: y, x2: x, y2: y + 26 * s, "stroke-width": 3 * s, class: "cb-map__tree-trunk" }, g);
    S("ellipse", { cx: x, cy: y - 4 * s, rx: 15 * s, ry: 18 * s, class: "cb-map__tree-leaf" + (light ? " is-light" : "") }, g);
  }
  function standPerson(g, x, y, c, s = 1) {
    const gg = S("g", { transform: `translate(${x} ${y}) scale(${s})`, style: `--c: ${c}` }, g);
    S("line", { x1: -4, y1: 18, x2: -5, y2: 40, "stroke-width": 4, "stroke-linecap": "round", class: "cb-person__arm" }, gg);
    S("line", { x1: 4, y1: 18, x2: 5, y2: 40, "stroke-width": 4, "stroke-linecap": "round", class: "cb-person__arm" }, gg);
    S("rect", { x: -8, y: -6, width: 16, height: 28, rx: 6, class: "cb-person__body" }, gg);
    S("circle", { cx: 0, cy: -14, r: 7, class: "cb-person__head" }, gg);
  }
  const fixture = document.querySelector('[data-map="fixture"]');
  if (fixture) {
    const g = S("g", {}, fixture);
    const mb = (pts, planters) => benchChain(g, pts, { w: 22, cap: 14, sh: 5, planters });
    mb([[520, 300], [600, 230], [690, 300], [780, 230], [860, 300]]);
    mb([[430, 520], [430, 410], [520, 360]]);
    mb([[760, 470], [880, 470]], [[880, 470]]);
    mb([[640, 880], [730, 820], [820, 880]]);
    mb([[980, 760], [1060, 720]]);
    mb([[1150, 400], [1250, 330], [1360, 400]], [[1250, 330]]);
    mb([[1460, 520], [1560, 470]]);
    mb([[1350, 900], [1350, 800], [1450, 760]], [[1350, 800]]);
    mb([[1750, 300], [1850, 360], [1950, 300]]);
    mb([[1780, 560], [1900, 560]], [[1900, 560]]);
    mb([[260, 860], [380, 800]]);
    mb([[2000, 860], [2090, 800], [2090, 700]]);
    [[560, 180, 1, 0], [600, 160, 0.8, 1], [930, 420, 1.1, 0], [960, 440, 0.8, 1], [700, 760, 1, 1], [1240, 220, 0.9, 0], [1500, 640, 1, 0],
      [1530, 660, 0.7, 1], [1690, 220, 1, 1], [1990, 480, 0.9, 0], [330, 640, 1, 1], [1820, 940, 1, 0], [1120, 900, 0.8, 1]].forEach(([x, y, s, l]) => tree(g, x, y, s, l));
    S("path", { d: "M600 690a38 38 0 1 1 30 64a38 38 0 1 1 -30 -64z", class: "cb-map__orange" }, g);
    S("path", { d: "M1080 600c30-14 70-8 76 22s-20 58-56 54-58-58-20-76z", class: "cb-map__blue" }, g);
    const pink = S("g", {}, g);
    S("path", { d: "M1100 780h50v-30h40v80h-90z", class: "cb-map__pink" }, pink);
    [[1112, 795], [1132, 795], [1160, 765], [1172, 795]].forEach(([x, y]) => S("rect", { x, y, width: 8, height: 6, class: "cb-map__window" }, pink));
    S("path", { d: "M1940 260l40-70 10 80z", class: "cb-map__yellow" }, g);
    S("path", { d: "M1010 540h70v-30l35-30 35 30v30h-140z", class: "cb-map__sage" }, g);
    S("path", { d: "M1290 120h60v-40h50v40h40v60h-150z", class: "cb-map__slate" }, g);
    S("path", { d: "M300 300l50-40 50 40v50h-100z", class: "cb-map__sage" }, g);
  }
  const CROWDS = {
    "people-1": [[480, 470], [700, 560], [1000, 380], [1420, 600], [1700, 820], [890, 900], [1880, 420]],
    "people-2": [[560, 380], [820, 630], [1180, 560], [1600, 380], [1300, 980], [420, 720], [2020, 620]],
    "people-3": [[640, 520], [940, 260], [1220, 760], [1560, 900], [1790, 660], [350, 400], [1100, 180]],
  };
  document.querySelectorAll('[data-map^="people-"]').forEach((svg, k) => {
    (CROWDS[svg.dataset.map] || []).forEach(([x, y], i) => standPerson(svg, x, y, PEOPLE[(i + k) % PEOPLE.length], 1.1));
  });

  /* ── Drawing: a base and seat placed on the plane (mm) are laid flat as in the original drawing, long axis at 20° and short axis at 35°, then stood up with dimension lines attached */
  const AX = [0.94, 0.34], AY = [-0.82, 0.57];
  const P = (x, y, z) => [x * AX[0] + y * AY[0], x * AX[1] + y * AY[1] - z];
  const depth = (x, y) => x * AX[1] + y * AY[1];
  const pts2 = (arr) => arr.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ");
  function prism(g, poly, z0, z1, slats) {
    const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length, cy = poly.reduce((s, p) => s + p[1], 0) / poly.length;
    poly.forEach((a, i) => {
      const b = poly[(i + 1) % poly.length];
      const mx = (a[0] + b[0]) / 2 - cx, my = (a[1] + b[1]) / 2 - cy;
      let nx = b[1] - a[1], ny = -(b[0] - a[0]);
      if (nx * mx + ny * my < 0) { nx = -nx; ny = -ny; }
      if (depth(nx, ny) <= 0) return;
      S("polygon", { points: pts2([P(a[0], a[1], z0), P(b[0], b[1], z0), P(b[0], b[1], z1), P(a[0], a[1], z1)]), class: "cb-iso__face", "vector-effect": "non-scaling-stroke" }, g);
    });
    S("polygon", { points: pts2(poly.map((p) => P(p[0], p[1], z1))), class: "cb-iso__face is-top", "vector-effect": "non-scaling-stroke" }, g);
    (slats || []).forEach(([a, b]) => {
      const p = P(a[0], a[1], z1), q = P(b[0], b[1], z1);
      S("line", { x1: p[0], y1: p[1], x2: q[0], y2: q[1], class: "cb-iso__slat", "vector-effect": "non-scaling-stroke" }, g);
    });
  }
  const rectAlong = (a, b, half, ext = 0) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
    const A = [a[0] - ux * ext, a[1] - uy * ext], B = [b[0] + ux * ext, b[1] + uy * ext];
    return { poly: [[A[0] + nx * half, A[1] + ny * half], [B[0] + nx * half, B[1] + ny * half], [B[0] - nx * half, B[1] - ny * half], [A[0] - nx * half, A[1] - ny * half]], ux, uy, nx, ny, A, B };
  };
  const PLANS = {
    straight: { chains: [[[0, 0], [1800, 0]], [[2300, 0], [4100, 0]], [[4600, 0], [6400, 0]]], person: [2900, 700] },
    surround: { chains: [[[0, 1800], [0, 0], [1560, -900], [3120, 0], [3120, 1800]]], person: [1560, 600] },
    corner: { chains: [[[2000, 0], [0, 0], [0, 2000]]], planter: [0, 0], person: [900, 900] },
    hexa: { chains: [[[0, 0], [1800, 0], [2700, 1560], [1800, 3120], [0, 3120], [-900, 1560], [0, 0]]], planter: [900, 1560], person: [2600, 300] },
  };
  function drawIso(svg, plan) {
    const g = S("g", {}, svg);
    const all = [];
    plan.chains.forEach((c) => c.forEach((p) => all.push(p)));
    const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
    const minX = Math.min(...xs) - 500, maxX = Math.max(...xs) + 500, minY = Math.min(...ys) - 500, maxY = Math.max(...ys) + 500;
    S("polygon", { points: pts2([P(minX, minY, 0), P(maxX, minY, 0), P(maxX, maxY, 0), P(minX, maxY, 0)]), class: "cb-iso__floor" }, g);
    const parts = [];
    plan.chains.forEach((c) => {
      c.forEach((p, i) => {
        const q = c[i + 1] || c[i - 1];
        const r = rectAlong(p, [p[0] + (q[0] - p[0]) * 0.01, p[1] + (q[1] - p[1]) * 0.01], 206, 0);
        const blk = rectAlong([p[0] - r.ux * 160, p[1] - r.uy * 160], [p[0] + r.ux * 160, p[1] + r.uy * 160], 206);
        parts.push({ d: depth(p[0], p[1]), f: () => prism(g, blk.poly, 0, 400) });
      });
      c.forEach((p, i) => {
        const q = c[i + 1];
        if (!q) return;
        const r = rectAlong(p, q, 206, -150);
        const slats = [-103, 0, 103].map((o) => [[r.A[0] + r.nx * o, r.A[1] + r.ny * o], [r.B[0] + r.nx * o, r.B[1] + r.ny * o]]);
        parts.push({ d: depth((p[0] + q[0]) / 2, (p[1] + q[1]) / 2) + 1e5, f: () => prism(g, r.poly, 400, 442, slats) });
      });
    });
    if (plan.planter) {
      const [x, y] = plan.planter;
      parts.push({ d: depth(x, y) + 2e5, f: () => prism(g, [[x - 300, y - 300], [x + 300, y - 300], [x + 300, y + 300], [x - 300, y + 300]], 0, 760) });
    }
    parts.sort((a, b) => a.d - b.d).forEach((p) => p.f());
    if (plan.person) {
      const [sx, sy] = P(plan.person[0], plan.person[1], 0);
      const pg = S("g", { class: "cb-iso__person" }, g);
      S("rect", { x: sx - 190, y: sy - 1380, width: 380, height: 1380, rx: 170 }, pg);
      S("circle", { cx: sx, cy: sy - 1560, r: 150 }, pg);
    }
    // Sets the viewBox around the drawing so it fills the cell (1060:448), and scales text up to be 15px on screen
    const box = g.getBBox();
    const k = Math.max(box.width / 640, box.height / 250) || 1;
    const dim = (a, b, side) => {
      const p = P(a[0], a[1], 0), q = P(b[0], b[1], 0);
      S("line", { x1: p[0], y1: p[1], x2: q[0], y2: q[1], class: "cb-iso__dim", "vector-effect": "non-scaling-stroke" }, g);
      [p, q].forEach((e) => S("circle", { cx: e[0], cy: e[1], r: 2.2 * k, class: "cb-iso__dot" }, g));
      const t = S("text", { x: (p[0] + q[0]) / 2 + side * 14 * k, y: (p[1] + q[1]) / 2 + 22 * k, class: "cb-iso__num", "text-anchor": "middle", "font-size": (15 * k).toFixed(0) }, g);
      t.textContent = "0000";
    };
    dim([minX + 200, maxY + 400], [maxX - 200, maxY + 400], -1);
    dim([maxX + 400, maxY - 200], [maxX + 400, minY + 200], 1);
    const b2 = g.getBBox();
    const unit = S("text", { x: b2.x + b2.width + 40 * k, y: b2.y + b2.height, class: "cb-iso__unit", "text-anchor": "end", "font-size": (13 * k).toFixed(0) }, g);
    unit.textContent = "(mm)";
    const b3 = g.getBBox(), pad = 10 * k;
    svg.setAttribute("viewBox", `${(b3.x - pad).toFixed(0)} ${(b3.y - pad).toFixed(0)} ${(b3.width + pad * 2).toFixed(0)} ${(b3.height + pad * 2).toFixed(0)}`);
  }
  document.querySelectorAll(".cb-iso").forEach((svg) => { const plan = PLANS[svg.dataset.iso]; if (plan) drawIso(svg, plan); });

  /* ── Two unit-linking images */
  const DIAGRAMS = {
    ab(svg) {
      S("line", { x1: 20, y1: 38, x2: 140, y2: 38, class: "cb-diagram__line" }, svg);
      S("line", { x1: 20, y1: 44, x2: 140, y2: 44, class: "cb-diagram__line" }, svg);
      S("rect", { x: 46, y: 33, width: 14, height: 16, class: "cb-diagram__soft" }, svg);
      S("rect", { x: 100, y: 33, width: 14, height: 16, class: "cb-diagram__fill" }, svg);
      [["A", 53, 28], ["A", 53, 60], ["B", 107, 28], ["B", 107, 60]].forEach(([s, x, y]) => { const t = S("text", { x, y, "text-anchor": "middle", class: "cb-diagram__txt" }, svg); t.textContent = s; });
      S("polyline", { points: "28,128 50,92 110,92 132,128", class: "cb-diagram__line" }, svg);
      S("polyline", { points: "34,132 55,98 105,98 126,132", class: "cb-diagram__line" }, svg);
      S("rect", { x: 44, y: 86, width: 14, height: 14, class: "cb-diagram__fill", transform: "rotate(-30 51 93)" }, svg);
      S("rect", { x: 102, y: 86, width: 14, height: 14, class: "cb-diagram__fill", transform: "rotate(30 109 93)" }, svg);
      [["120°", 58, 124], ["120°", 102, 124], ["B", 38, 92], ["A", 54, 80], ["B", 106, 80], ["A", 122, 92]].forEach(([s, x, y]) => { const t = S("text", { x, y, "text-anchor": "middle", class: "cb-diagram__txt" }, svg); t.textContent = s; });
    },
    cd(svg) {
      S("rect", { x: 30, y: 16, width: 100, height: 10, class: "cb-diagram__line" }, svg);
      S("rect", { x: 30, y: 14, width: 4, height: 14, class: "cb-diagram__fill" }, svg);
      S("rect", { x: 126, y: 14, width: 4, height: 14, class: "cb-diagram__fill" }, svg);
      [["C", 32, 10], ["C", 128, 10]].forEach(([s, x, y]) => { const t = S("text", { x, y, "text-anchor": "middle", class: "cb-diagram__txt" }, svg); t.textContent = s; });
      [[20, 92, 140, 92], [20, 100, 140, 100], [76, 50, 76, 136], [84, 50, 84, 136]].forEach(([x1, y1, x2, y2]) => S("line", { x1, y1, x2, y2, class: "cb-diagram__line" }, svg));
      S("rect", { x: 72, y: 88, width: 16, height: 16, class: "cb-diagram__fill" }, svg);
      [["90°", 62, 82], ["90°", 98, 82], ["90°", 62, 118], ["90°", 98, 118], ["C", 132, 62], ["D", 132, 134]].forEach(([s, x, y]) => { const t = S("text", { x, y, "text-anchor": "middle", class: "cb-diagram__txt" }, svg); t.textContent = s; });
    },
  };
  document.querySelectorAll("[data-diagram]").forEach((svg) => DIAGRAMS[svg.dataset.diagram]?.(svg));

  /* ── Spec section: four photos + small photo row + table */
  const dlBox = (extra = "") => `<div class="cb-dl${extra}"><button class="cb-dl__title" type="button">Product drawing<svg aria-hidden="true"><use href="#cb-i-dl"/></svg></button><ul><li><a href="#">2D drawing (PDF)</a></li><li><a href="#">2D drawing (DXF)</a></li><li><a href="#">User Manual</a></li></ul></div>`;
  const shots = (main) => [main, main.replace(/^[^·]+/, "Same unit in dark color"), "Close-up of a leg joint · white background · side view 11:8", "Seat grain close-up · soft light · top view 11:8"];
  document.querySelectorAll(".cb-sblock[data-spec]").forEach((blk) => {
    const id = blk.dataset.spec, colors = +blk.dataset.colors, labels = shots(blk.dataset.labelPhoto || "Product photo");
    const slides = labels.map((l) => `<div class="swiper-slide"><div class="wf-img" data-label="${l}"></div></div>`).join("");
    const tips = colors ? `<span class="color active">Light Color (LO)</span> / <span class="color">Dark Color (DO)</span><div class="cb-tips"><button type="button" class="active" data-index="0" style="--tip: var(--site-wood)" aria-label="Light color"></button><button type="button" data-index="1" style="--tip: var(--site-wood-dark)" aria-label="Dark color"></button></div>` : `<span class="color active">Your color name here</span>`;
    blk.appendChild(H(`<div class="cb-sblock__spec">
      <div class="cb-sblock__slider">
        <div class="swiper cb-sblock__main" data-swiper="${id}"><div class="swiper-wrapper">${slides}</div>
          <div class="swiper-button-next cb-arrow"><svg aria-hidden="true"><use href="#cb-i-next"/></svg></div>
          <div class="swiper-button-prev cb-arrow"><svg aria-hidden="true"><use href="#cb-i-prev"/></svg></div></div>
        <div class="swiper cb-sblock__thumbs"><div class="swiper-wrapper">${slides}</div></div>
      </div>
      ${dlBox(" is-sp")}
      <div class="cb-info">
        <dl><dt>Color</dt><dd>${tips}</dd></dl>
        <dl><dt>Item number</dt><dd><span class="number active">AAA-00-0000-LO</span>${colors ? ' / <span class="number">AAA-00-0000-DO</span>' : ""}</dd></dl>
        <dl><dt>Size</dt><dd>W 0000 × H 00 (total height 00.0) × D 000</dd></dl>
        <dl><dt>Weight</dt><dd>00kg</dd></dl>
        <dl><dt>Texture</dt><dd>Outer: your material here  Inner: your material here</dd></dl>
        <dl><dt>Deadline</dt><dd>Your finishing method here</dd></dl>
        <div class="cb-info__detail">${dlBox()}<div class="cb-price"><span>List Price&nbsp;</span>₩000,000<span>(VAT excluded)</span></div></div>
      </div>
    </div>`));
  });

  /* ── Combo example sixteen — number · list price · photo · unit count */
  const slidesBox = document.querySelector('[data-setup="slides"]'), thumbsBox = document.querySelector('[data-setup="thumbs"]');
  if (slidesBox && thumbsBox) {
    const names = ["Unit A", "Unit B", "Base A", "Base B", "Base C", "Base D"];
    for (let i = 1; i <= 16; i++) {
      const no = `No.${String(i).padStart(2, "0")}`;
      const counts = names.map((_, k) => ((i * 7 + k * 3) % 5 === 0 ? String(((i + k) % 3) + 1) : "-"));
      slidesBox.appendChild(H(`<div class="swiper-slide"><div class="cb-pattern">
        <div class="cb-pattern__no">${no}</div>
        <div class="cb-pattern__price"><span>List price</span>₩000,000 <span>(VAT excluded)</span></div>
        <div class="cb-pattern__photo"><div class="wf-img" data-label="Combination ${no} Render — bench and base combinations with dimension lines · light gray background · angled from above 4:3"></div></div>
        <div class="cb-pattern__size">(mm)</div>
        <div class="cb-pattern__info">${dlBox()}<div class="cb-pattern__units"><ul>${names.map((nm, k) => `<li><span class="name">${nm}</span>:<span class="num">${counts[k]}</span></li>`).join("")}</ul></div></div>
      </div></div>`));
      thumbsBox.appendChild(H(`<div class="swiper-slide"><div class="wf-img" data-label="Combination ${no} Small render"></div><div class="select">${no}</div></div>`));
    }
  }

  /* ── Scene photo strip — two copies of the same list joined, one loop in 80s */
  const SCENES = ["Plaza in front of the office", "University campus courtyard", "Park hill trail", "Terrace outside the mall"];
  const SCENES2 = ["Walkway in front of the station", "Under the gallery stairs", "Venue wide plaza", "Tree-lined street sidewalk"];
  document.querySelectorAll("[data-scenes]").forEach((wrap) => {
    const side = wrap.dataset.scenes, list = side === "left" ? SCENES : SCENES2;
    const items = list.map((s, i) => `<li class="cb-scenes__item"><div class="wf-img" data-label="${s} · Daytime scene with a bench · landscape 3:2"></div><p>PLACE NAME ${String(i + 1).padStart(2, "0")}</p></li>`).join("");
    for (let k = 0; k < 2; k++) wrap.appendChild(H(`<ul class="cb-scenes__list is-${side}"${k ? ' aria-hidden="true"' : ""}>${items}</ul>`));
  });

  /* ── Tab */
  const tabs = document.querySelectorAll(".cb-tab"), panes = document.querySelectorAll(".cb-tabc");
  tabs.forEach((tab) => {
    const go = () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      panes.forEach((p) => p.classList.toggle("active", p.dataset.tab === tab.dataset.tab));
    };
    tab.addEventListener("click", go);
    tab.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  });

  /* Swiper — original values as they are: spec photo loop · 600ms + small photos 5 slots 10px, combination example loop · 900ms + small photos advance 4/8/9 slots at a time */
  if (window.Swiper) {
    document.querySelectorAll(".cb-sblock__spec").forEach((spec) => {
      const main = spec.querySelector(".cb-sblock__main"), thumbsEl = spec.querySelector(".cb-sblock__thumbs");
      const thumbs = new Swiper(thumbsEl, { slidesPerView: 5, spaceBetween: 10 });
      const sw = new Swiper(main, {
        loop: true, effect: "slide", speed: 600,
        navigation: { nextEl: main.querySelector(".swiper-button-next"), prevEl: main.querySelector(".swiper-button-prev") },
        thumbs: { swiper: thumbs },
      });
      const info = spec.querySelector(".cb-info");
      const mark = (idx) => {
        info.querySelectorAll(".cb-tips button").forEach((b) => b.classList.toggle("active", +b.dataset.index === idx));
        info.querySelectorAll(".color").forEach((c, i) => c.classList.toggle("active", i === idx));
        info.querySelectorAll(".number").forEach((c, i) => c.classList.toggle("active", i === idx));
      };
      info.querySelectorAll(".cb-tips button").forEach((b) => b.addEventListener("click", () => { sw.slideToLoop(+b.dataset.index); mark(+b.dataset.index); }));
      sw.on("slideChange", () => mark(sw.realIndex));
    });
    const thumbEl = document.querySelector(".cb-setup__thumbs"), wrapEl = document.querySelector(".cb-setup__thumb");
    if (thumbEl && wrapEl) {
      const thumb = new Swiper(thumbEl, {
        slidesPerView: 4, spaceBetween: 5, slidesPerGroup: 4, effect: "slide", speed: 900,
        navigation: { nextEl: wrapEl.querySelector(".swiper-button-next"), prevEl: wrapEl.querySelector(".swiper-button-prev") },
        breakpoints: { 1024: { slidesPerView: 9, slidesPerGroup: 9 }, 768: { slidesPerView: 8, slidesPerGroup: 8 } },
      });
      new Swiper(".cb-setup__slider", { loop: true, effect: "slide", speed: 900, thumbs: { swiper: thumb } });
    }
  }
})();
