// First page: raise the village picture → unfold the circle → logo entrance and sway → Get Started (how to use) → three stage buttons.
// The original village is a single hand-drawn SVG. Here we build the same composition (seen obliquely from above, a village with staggered roads) out of isometric cells —
// Seed is fixed so the same picture always comes out, and color is handled by --site-* in index.css just by adding classes.
(() => {
  const TKB = window.TKB;
  const NS = "http://www.w3.org/2000/svg";
  const mk = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const rng = (seed) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pts = (a) => a.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const poly = (g, cls, a) => mk("polygon", { class: cls, points: pts(a) }, g);
  const up = (p, z) => [p[0], p[1] - z];
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

  // One box: four floor corners A (back) · B (right) · C (front) · D (left), visible faces are the two attached to C and the top
  const box = (g, P, i0, j0, i1, j1, z, h, c) => {
    const A = up(P(i0, j0), z), B = up(P(i1, j0), z), C = up(P(i1, j1), z), D = up(P(i0, j1), z);
    poly(g, c[1], [D, C, up(C, h), up(D, h)]);
    poly(g, c[2], [C, B, up(B, h), up(C, h)]);
    poly(g, c[0], [up(A, h), up(B, h), up(C, h), up(D, h)]);
    return { A, B, C, D };
  };
  const windows = (g, from, to, z0, floors, fh, n, band) => {
    for (let f = 0; f < floors; f++) {
      const za = z0 + f * fh + fh * 0.3, zb = z0 + f * fh + fh * 0.8;
      const quad = (u0, u1) => { const a = lerp(from, to, u0), b = lerp(from, to, u1); poly(g, "f-glass", [up(a, za), up(b, za), up(b, zb), up(a, zb)]); };
      if (band) { quad(0.06, 0.94); continue; }
      for (let k = 0; k < n; k++) quad((k + 0.2) / n, (k + 0.8) / n);
    }
  };
  const tree = (g, p, r, rand, late) => {
    const t = mk("g", { class: `a-sway${late ? " is-late" : ""}` }, g);
    mk("rect", { class: "f-trunk", x: p[0] - 3, y: p[1] - r * 1.1, width: 6, height: r * 1.1 }, t);
    const n = 2 + Math.floor(rand() * 2);
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + rand();
      mk("circle", { class: k === n - 1 ? "f-tree" : "f-tree2", cx: p[0] + Math.cos(a) * r * 0.45, cy: p[1] - r * 1.5 + Math.sin(a) * r * 0.3, r: r * (0.7 + rand() * 0.2) }, t);
    }
    mk("circle", { class: "f-tree", cx: p[0], cy: p[1] - r * 1.9, r: r * 0.75 }, t);
  };
  const person = (g, p, rand) => {
    const t = mk("g", { class: rand() < 0.5 ? "a-bob" : "" }, g);
    const tones = ["f-car-a", "f-car-b", "f-yellow", "f-car-c", "f-roof-dark"];
    mk("rect", { class: tones[Math.floor(rand() * tones.length)], x: p[0] - 4, y: p[1] - 16, width: 8, height: 12, rx: 3 }, t);
    mk("rect", { class: "f-roof-dark", x: p[0] - 3.5, y: p[1] - 5, width: 7, height: 6, rx: 1 }, t);
    mk("circle", { class: "f-skin", cx: p[0], cy: p[1] - 21, r: 5 }, t);
  };
  const car = (g, P, i, j, alongI, cls) => {
    const L = 0.48, W = 0.26;
    const [i0, i1, j0, j1] = alongI ? [i - L, i + L, j - W, j + W] : [i - W, i + W, j - L, j + L];
    const tone = [cls, cls, `${cls} f-shade`];
    box(g, P, i0, j0, i1, j1, 3, 13, tone);
    const s = 0.55;
    const ci0 = alongI ? i - L * s : i0 + 0.04, ci1 = alongI ? i + L * 0.35 : i1 - 0.04;
    const cj0 = alongI ? j0 + 0.04 : j - L * s, cj1 = alongI ? j1 - 0.04 : j + L * 0.35;
    box(g, P, ci0, cj0, ci1, cj1, 16, 11, ["f-paper", "f-glass", "f-glass"]);
  };

  // ── Village ──
  function drawTown(svg) {
    const rand = rng(7);
    const N = 46, TW = 82, TH = TW / 2;
    const P = (i, j) => [690 + ((i - j) * TW) / 2, 545 + ((i + j - N) * TH) / 2];
    const seen = (p, m = 160) => p[0] > -m && p[0] < 1380 + m && p[1] > -m && p[1] < 1090 + m * 1.6;
    const isRoad = (k) => (k + 5) % 9 < 2;

    const ground = mk("g", {}, svg);
    mk("rect", { class: "f-road no-line", x: -50, y: -50, width: 1480, height: 1190 }, ground);
    const items = [];
    const add = (key, fn) => items.push({ key, fn });

    // Block: 7×7 cells between road strips
    const starts = [];
    for (let k = 0; k < N; k++) if (!isRoad(k) && isRoad(k - 1)) starts.push(k);
    let playground = 0, cats = 0;
    for (const bi of starts) for (const bj of starts) {
      const bi1 = bi + 7, bj1 = bj + 7;
      const mid = P((bi + bi1) / 2, (bj + bj1) / 2);
      if (!seen(mid, 420)) continue;
      poly(ground, "f-walk", [P(bi, bj), P(bi1, bj), P(bi1, bj1), P(bi, bj1)]);
      poly(ground, "f-lot", [P(bi + 0.35, bj + 0.35), P(bi1 - 0.35, bj + 0.35), P(bi1 - 0.35, bj1 - 0.35), P(bi + 0.35, bj1 - 0.35)]);

      // Cut the block two or three times into lots
      const lots = [];
      const split = (r, d) => {
        const wi = r[2] - r[0], wj = r[3] - r[1];
        if (d >= 3 || (wi < 2.6 && wj < 2.6) || (d >= 1 && rand() < 0.22)) return lots.push(r);
        const alongI = wi > wj ? true : wi < wj ? false : rand() < 0.5;
        const t = 0.36 + rand() * 0.28;
        if (alongI) { const m = r[0] + wi * t; split([r[0], r[1], m, r[3]], d + 1); split([m, r[1], r[2], r[3]], d + 1); }
        else { const m = r[1] + wj * t; split([r[0], r[1], r[2], m], d + 1); split([r[0], m, r[2], r[3]], d + 1); }
      };
      split([bi + 0.55, bj + 0.55, bi1 - 0.55, bj1 - 0.55], 0);

      for (const r of lots) {
        const [i0, j0, i1, j1] = [r[0] + 0.12, r[1] + 0.12, r[2] - 0.12, r[3] - 0.12];
        const area = (i1 - i0) * (j1 - j0);
        const roll = rand();
        const key = i1 + j1;
        if (!playground && area > 5 && bi === 15 && bj === 24) {
          playground = 1;
          poly(ground, "f-sand", [P(i0, j0), P(i1, j0), P(i1, j1), P(i0, j1)]);
          add(key, (g) => {
            const a = P(i0 + 0.8, j0 + 0.8), b = P(i0 + 2.2, j0 + 0.8);
            const swing = mk("g", {}, g);
            for (const q of [a, b]) mk("path", { class: "f-paper", d: `M${q[0] - 14},${q[1]} L${q[0]},${q[1] - 70} L${q[0] + 14},${q[1]}`, fill: "none" }, swing);
            mk("line", { x1: a[0], y1: a[1] - 70, x2: b[0], y2: b[1] - 70 }, swing);
            for (const u of [0.3, 0.7]) {
              const q = lerp(a, b, u);
              const s = mk("g", { class: "a-swing" }, swing);
              mk("line", { x1: q[0] - 6, y1: q[1] - 70, x2: q[0] - 6, y2: q[1] - 18 }, s);
              mk("line", { x1: q[0] + 6, y1: q[1] - 70, x2: q[0] + 6, y2: q[1] - 18 }, s);
              mk("rect", { class: "f-car-b", x: q[0] - 10, y: q[1] - 20, width: 20, height: 5, rx: 2 }, s);
            }
            for (let k = 0; k < 3; k++) person(g, P(i0 + 1 + rand() * (i1 - i0 - 1.5), j0 + 1.6 + rand() * (j1 - j0 - 2)), rand);
            tree(g, P(i1 - 0.5, j1 - 0.5), 22, rand);
          });
        } else if (roll < 0.2 || area < 1.1) {
          poly(ground, "f-grass", [P(i0, j0), P(i1, j0), P(i1, j1), P(i0, j1)]);
          const n = Math.max(1, Math.round(area * 0.9));
          const spots = [];
          for (let k = 0; k < n; k++) spots.push([i0 + 0.3 + rand() * (i1 - i0 - 0.6), j0 + 0.3 + rand() * (j1 - j0 - 0.6)]);
          spots.sort((a, b) => a[0] + a[1] - b[0] - b[1]);
          for (const s of spots) add(s[0] + s[1], (g) => tree(g, P(s[0], s[1]), 16 + rand() * 10, rand, rand() < 0.5));
        } else if (roll < 0.36) {
          // Gable roof house
          add(key, (g) => {
            const floors = rand() < 0.5 ? 1 : 2, h = floors * 26 + 6;
            const walls = [["f-w1", "f-w1s"], ["f-w3", "f-w3s"], ["f-w2", "f-w2s"]][Math.floor(rand() * 3)];
            const roofs = ["f-roof-blue", "f-roof-pink", "f-roof-dark", "f-roof-brick", "f-roof-dark"];
            const roof = roofs[Math.floor(rand() * roofs.length)];
            const { A, B, C, D } = box(g, P, i0, j0, i1, j1, 0, h, ["f-roof", walls[0], walls[1]]);
            windows(g, D, C, 0, floors, 26, Math.max(1, Math.round((i1 - i0) * 1.2)), false);
            const rh = 22 + (j1 - j0) * 10;
            const R0 = up(lerp(A, D, 0.5), h + rh), R1 = up(lerp(B, C, 0.5), h + rh);
            poly(g, roof, [up(A, h), up(B, h), R1, R0]);
            poly(g, walls[1], [up(C, h), up(B, h), R1]);
            poly(g, roof, [up(D, h - 2), up(C, h - 2), R1, R0]);
            if (rand() < 0.45) {
              const ch = lerp(R0, R1, 0.7);
              mk("rect", { class: "f-roof-dark", x: ch[0] - 6, y: ch[1] - 6, width: 12, height: 20 }, g);
              const puff = mk("g", { class: "a-puff" }, g);
              for (let k = 0; k < 3; k++) mk("circle", { class: "f-paper", cx: ch[0] + 6 + k * 7, cy: ch[1] - 14 - k * 12, r: 6 + k * 2 }, puff);
            }
            const door = lerp(D, C, 0.78);
            poly(g, "f-roof-dark", [door, lerp(door, C, 0.4), up(lerp(door, C, 0.4), 20), up(door, 20)]);
          });
        } else if (roll < 0.44) {
          // Parking lot
          poly(ground, "f-walk", [P(i0, j0), P(i1, j0), P(i1, j1), P(i0, j1)]);
          for (let k = 1; k < Math.floor(i1 - i0) * 2; k++) {
            const u = i0 + k * 0.5;
            mk("line", { class: "f-pline", x1: P(u, j0)[0], y1: P(u, j0)[1], x2: P(u, j0 + 0.6)[0], y2: P(u, j0 + 0.6)[1] }, ground);
          }
          const tones = ["f-car-a", "f-car-b", "f-car-c", "f-car-d", "f-car-e"];
          add(key, (g) => { for (let u = i0 + 0.5; u < i1 - 0.3; u += 1) if (rand() < 0.6) car(g, P, u, j0 + 0.45, false, tones[Math.floor(rand() * tones.length)]); });
        } else {
          // Building
          add(key, (g) => {
            const floors = 1 + Math.floor(Math.pow(rand(), 1.6) * 6);
            const fh = 24, h = floors * fh + 6;
            const tones = [["f-w1", "f-w1s"], ["f-w1", "f-w1s"], ["f-w1", "f-w1s"], ["f-w2", "f-w2s"], ["f-w3", "f-w3s"], ["f-w4", "f-w4s"]];
            const w = tones[Math.floor(rand() * tones.length)];
            const { A, B, C, D } = box(g, P, i0, j0, i1, j1, 0, h, ["f-roof", w[0], w[1]]);
            const band = rand() < 0.25;
            windows(g, D, C, 0, floors, fh, Math.max(1, Math.round((i1 - i0) * 1.7)), band);
            windows(g, C, B, 0, floors, fh, Math.max(1, Math.round((j1 - j0) * 1.7)), band);
            poly(g, "f-roof", [lerp(up(A, h), up(C, h), 0.06), lerp(up(B, h), up(D, h), 0.06), lerp(up(C, h), up(A, h), 0.06), lerp(up(D, h), up(B, h), 0.06)]);
            if (floors > 2 && rand() < 0.5) {
              const ci = (i0 + i1) / 2, cj = (j0 + j1) / 2;
              box(g, P, ci - 0.35, cj - 0.3, ci + 0.35, cj + 0.3, h, 18, ["f-roof", w[0], w[1]]);
            }
            if (rand() < 0.3) {
              const s0 = up(lerp(D, C, 0.12), fh * 0.95), s1 = up(lerp(D, C, 0.88), fh * 0.95);
              poly(g, "f-sign", [s0, s1, up(s1, 9), up(s0, 9)]);
            }
            if (!cats && floors <= 2 && rand() < 0.5) {
              cats = 1;
              const cp = up(lerp(A, B, 0.5), h);
              const cat = mk("g", { class: "t-jump", "data-clickable": "true", "aria-label": "Cat" }, g);
              mk("ellipse", { class: "f-paper", cx: cp[0], cy: cp[1] - 8, rx: 11, ry: 7 }, cat);
              mk("circle", { class: "f-paper", cx: cp[0] + 10, cy: cp[1] - 16, r: 6 }, cat);
              mk("path", { class: "f-paper", d: `M${cp[0] + 6},${cp[1] - 20} l2,-7 l4,5 M${cp[0] + 12},${cp[1] - 21} l3,-6 l2,7` }, cat);
              mk("path", { d: `M${cp[0] - 10},${cp[1] - 9} q-10,-4 -8,-16`, fill: "none" }, cat);
            }
          });
        }
      }
      // A few roadside trees
      for (let k = 0; k < 6; k++) {
        const side = rand() < 0.5;
        const s = side ? [bi + 0.18, bj + 1 + rand() * 5] : [bi + 1 + rand() * 5, bj1 - 0.18];
        if (rand() < 0.7) add(s[0] + s[1], (g) => tree(g, P(s[0], s[1]), 15, rand, k % 2 === 0));
      }
      // Person on the road
      for (let k = 0; k < 2; k++) {
        const s = rand() < 0.5 ? [bi1 - 0.15, bj + 0.5 + rand() * 6] : [bi + 0.5 + rand() * 6, bj1 - 0.15];
        add(s[0] + s[1] + 0.1, (g) => person(g, P(s[0], s[1]), rand));
      }
    }

    // Road: center dashed line, crosswalk stripes, traffic light, car
    for (let r = 0; r < N; r++) {
      if (!(isRoad(r) && !isRoad(r - 1))) continue;
      const c = r + 1;
      for (const bj of starts) {
        const a = P(c, bj + 0.6), b = P(c, bj + 6.4);
        if (seen(a, 300) || seen(b, 300)) mk("line", { class: "f-dash", x1: a[0], y1: a[1], x2: b[0], y2: b[1] }, ground);
        const a2 = P(bj + 0.6, c), b2 = P(bj + 6.4, c);
        if (seen(a2, 300) || seen(b2, 300)) mk("line", { class: "f-dash", x1: a2[0], y1: a2[1], x2: b2[0], y2: b2[1] }, ground);
      }
      for (const s of starts) {
        const q = s - 2;
        if (!seen(P(r + 1, q + 1), 200)) continue;
        // Crosswalks on all four sides — six stripes
        for (let t = 0; t < 6; t++) {
          const u = r + 0.12 + t * 0.32;
          poly(ground, "f-mark", [P(u, q - 0.75), P(u + 0.18, q - 0.75), P(u + 0.18, q - 0.15), P(u, q - 0.15)]);
          poly(ground, "f-mark", [P(r - 0.75, q + 0.12 + t * 0.32), P(r - 0.15, q + 0.12 + t * 0.32), P(r - 0.15, q + 0.3 + t * 0.32), P(r - 0.75, q + 0.3 + t * 0.32)]);
        }
        if (rand() < 0.6) {
          const lp = P(r - 0.15, q - 0.15);
          add(r + q - 0.3, (g) => {
            mk("line", { x1: lp[0], y1: lp[1], x2: lp[0], y2: lp[1] - 62 }, g);
            mk("rect", { class: "f-roof-dark", x: lp[0] - 7, y: lp[1] - 80, width: 14, height: 22, rx: 3 }, g);
            mk("circle", { class: "f-light a-light no-line", cx: lp[0], cy: lp[1] - 73, r: 4 }, g);
            mk("circle", { class: "f-paper no-line", cx: lp[0], cy: lp[1] - 64, r: 4 }, g);
          });
        }
      }
      // Difference
      const tones = ["f-car-a", "f-car-b", "f-car-c", "f-car-d", "f-car-e"];
      for (const bj of starts) {
        if (rand() < 0.55) { const i = c - 0.5 + (rand() < 0.5 ? 0 : 1), j = bj + 1 + rand() * 5; if (seen(P(i, j))) add(i + j, (g) => car(g, P, i, j, false, tones[Math.floor(rand() * 5)])); }
        if (rand() < 0.55) { const i = bj + 1 + rand() * 5, j = c - 0.5 + (rand() < 0.5 ? 0 : 1); if (seen(P(i, j))) add(i + j, (g) => car(g, P, i, j, true, tones[Math.floor(rand() * 5)])); }
      }
    }

    // One bird — jumps when tapped
    add(999, (g) => {
      const p = [930, 210];
      const bird = mk("g", { class: "t-jump", "data-clickable": "true", "aria-label": "Bird" }, g);
      const b = mk("g", { class: "a-bird" }, bird);
      mk("ellipse", { class: "f-car-a", cx: p[0], cy: p[1], rx: 12, ry: 9 }, b);
      mk("circle", { class: "f-car-a", cx: p[0] + 10, cy: p[1] - 8, r: 6 }, b);
      mk("path", { class: "f-yellow", d: `M${p[0] + 15},${p[1] - 9} l7,2 l-7,3z` }, b);
      mk("path", { class: "f-paper", d: `M${p[0] - 8},${p[1] - 2} q6,-12 14,0z` }, b);
    });

    const layer = mk("g", {}, svg);
    items.sort((a, b) => a.key - b.key).forEach((it) => it.fn(layer));
  }

  // ── Stage thumbnails: cut-out room, auditorium, snowy parking lot ──
  function drawRoom(svg) {
    const rand = rng(Number(svg.dataset.seed) || 1);
    const tone = svg.dataset.tone;
    const N = 12, TW = 60;
    const P = (i, j) => [375 + ((i - j) * TW) / 2, 12 + ((i + j) * TW) / 4];
    const floor = tone === "snow" ? "f-snow" : tone === "hall" ? "f-floor-gray" : "f-floor-wood";
    poly(svg, floor, [P(0, 0), P(N, 0), P(N, N), P(0, N)]);
    if (tone !== "snow") {
      poly(svg, "f-w1s", [P(0, 0), P(0, N), up(P(0, N), 70), up(P(0, 0), 70)]);
      poly(svg, "f-w2", [P(0, 0), P(N, 0), up(P(N, 0), 70), up(P(0, 0), 70)]);
      windows(svg, P(0, 0), P(N, 0), 0, 1, 70, 4, false);
    }
    const g = mk("g", {}, svg);
    if (tone === "home") {
      box(g, P, 5.8, 0, 6.1, 7, 0, 60, ["f-roof", "f-w1", "f-w1s"]);
      box(g, P, 0, 6.8, 5.8, 7.1, 0, 60, ["f-roof", "f-w1", "f-w1s"]);
      box(g, P, 0.4, 0.3, 2.6, 3.8, 0, 16, ["f-car-b", "f-w3", "f-w3s"]);
      box(g, P, 0.6, 0.5, 1.2, 1.4, 16, 6, ["f-paper", "f-w1", "f-w1s"]);
      box(g, P, 3.2, 0.3, 5.4, 1.2, 0, 34, ["f-yellow", "f-w1", "f-w1s"]);
      box(g, P, 7, 0.3, 8.2, 1.4, 0, 30, ["f-car-a", "f-w1", "f-w1s"]);
      box(g, P, 8.6, 3, 10.6, 5, 0, 22, ["f-roof", "f-w4", "f-w4s"]);
      box(g, P, 1, 8, 3, 10, 0, 14, ["f-car-c", "f-w2", "f-w2s"]);
      for (let k = 0; k < 4; k++) person(g, P(2 + rand() * 8, 2 + rand() * 8), rand);
    } else if (tone === "hall") {
      for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) {
        const i = 1 + a * 2.7, j = 1 + b * 2.7;
        box(g, P, i, j, i + 2.2, j + 2.2, 0, 3, ["f-paper", "f-w2", "f-w2s"]);
        box(g, P, i, j, i + 2.2, j + 0.12, 0, 26, ["f-roof", "f-w1", "f-w1s"]);
        if (rand() < 0.6) box(g, P, i + 0.3, j + 0.5, i + 1.8, j + 1.4, 3, 8, [rand() < 0.5 ? "f-car-b" : "f-car-a", "f-w1", "f-w1s"]);
      }
      for (let k = 0; k < 5; k++) person(g, P(1 + rand() * 10, 1 + rand() * 10), rand);
    } else {
      const tones = ["f-car-a", "f-car-b", "f-car-c", "f-car-d", "f-car-e"];
      for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) car(g, P, 2 + a * 3.6, 2 + b * 3.6, b % 2 === 0, tones[(a + b * 2) % 5]);
      for (let k = 0; k < 7; k++) { const s = P(rand() * N, rand() * N); mk("ellipse", { class: "f-paper", cx: s[0], cy: s[1], rx: 18 + rand() * 14, ry: 7 + rand() * 4 }, g); }
      for (let k = 0; k < 4; k++) tree(g, P(rand() * 2, 2 + rand() * 9), 14, rand);
    }
  }

  // ── Map size — original resizes(): if the screen is wide, 1.1x the width (if wider than 1.9, the width as is), if tall, based on height ──
  let page = null;
  const sizeMap = () => {
    const drag = page?.drag;
    if (!drag) return;
    const ta = Number(drag.dataset.aspect), ts = Number(drag.dataset.scale);
    const asp = innerWidth / innerHeight;
    drag.style.width = `${asp > ta ? (asp > 1.9 ? innerWidth : innerWidth * ts) : innerHeight * ts * ta}px`;
  };
  addEventListener("resize", sizeMap);

  // ── Map drag — exactly the original Maps.init: mouse uses jQuery UI draggable (clamps the drop position to ±(image−screen)/2),
  // Fingers move x · y with document-wide touchstart/touchmove and pinch 1–2x with Hammer. Finger movement is ignored while a modal is up ──
  let defscale = 1, nowscale = 1;
  const setScale = (el, v) => {
    el.style.transform = `scale(${v})`;
    nowscale = defscale = v;
  };
  const startDrag = () => {
    const { drag, map } = page;
    page.hammer?.destroy();
    const $inner = $(drag);
    if ($inner.draggable("instance")) $inner.draggable("destroy");
    $inner.draggable({
      cancel: ".t-press, .t-jump",
      scroll: false,
      drag(e, ui) {
        const r = drag.getBoundingClientRect();
        const defW = (r.width - innerWidth) / 2 / defscale;
        const defH = (r.height - innerHeight) / 2 / defscale;
        ui.position.left = Math.min(Math.max(ui.position.left, -defW), defW);
        ui.position.top = Math.min(Math.max(ui.position.top, -defH), defH);
      },
    });
    const hammer = (page.hammer = new Hammer(map));
    hammer.get("pinch").set({ enable: true });
    hammer.on("pinch", (e) => setScale(map, Math.max(Math.min(e.scale * defscale, 2), 1)));
    hammer.on("pinchend pinchcancel", () => { defscale = nowscale; });
  };
  let startX = 0, startY = 0, keepX = 0, keepY = 0, defW = 0, defH = 0;
  const matrixOf = (el) => {
    const m = getComputedStyle(el).transform;
    return m && m !== "none" ? m.match(/matrix.*\((.+)\)/)[1].split(", ").map(parseFloat) : null;
  };
  document.addEventListener("touchstart", (e) => {
    if (!page?.dragOn) return;
    const { drag, map } = page;
    startX = e.touches[0].pageX;
    startY = e.touches[0].pageY;
    const parentScale = matrixOf(map)?.[0] ?? 1;
    const r = drag.getBoundingClientRect();
    defW = (r.width - innerWidth) / 2 / parentScale;
    defH = (r.height - innerHeight) / 2 / parentScale;
    const m = matrixOf(drag);
    if (m) { keepX = m[4]; keepY = m[5]; }
  }, { passive: true });
  document.addEventListener("touchmove", (e) => {
    if (!page?.dragOn || document.body.classList.contains("is-modal")) return;
    const x = keepX + (e.changedTouches[0].pageX - startX) / defscale;
    const y = keepY + (e.changedTouches[0].pageY - startY) / defscale;
    gsap.set(page.drag, { x: Math.min(Math.max(-defW, x), defW), y: Math.min(Math.max(-defH, y), defH) });
  }, { passive: true });

  // Cat and bird — press to make them hop for 1s
  document.addEventListener("click", (e) => {
    const j = e.target.closest && e.target.closest(".t-jump");
    if (!j) return;
    j.classList.remove("is-jump");
    void j.getBoundingClientRect();
    j.classList.add("is-jump");
    TKB.later(1, () => j.classList.remove("is-jump"));
  });

  // ── How-to slider — exactly the original Slider.init slick settings (center aligned · 25% at each side · one slide below 860 · .8s), dots hidden on the last slide ──
  const howto = document.getElementById("howto");
  const dots = document.getElementById("t-howto-dots");
  const $slides = $("#t-howto-track");
  $slides.on("beforeChange", (e, slick, cur, next) => dots.classList.toggle("is-hidden", next === 4)).slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    infinite: false,
    initialSlide: 0,
    centerPadding: "25%",
    dots: true,
    centerMode: true,
    focusOnSelect: false,
    variableWidth: false,
    adaptiveHeight: false,
    arrows: true,
    prevArrow: howto.querySelector(".t-howto__arrow.is-prev"),
    nextArrow: howto.querySelector(".t-howto__arrow.is-next"),
    appendDots: dots,
    touchThreshold: 5,
    autoplay: false,
    pauseOnHover: true,
    autoplaySpeed: 7000,
    waitForAnimate: false,
    speed: 800,
    useCSS: true,
    responsive: [{ breakpoint: 860, settings: { centerPadding: 0 } }],
  });
  const openHowto = (at) => {
    $slides.slick("slickGoTo", at, true);
    TKB.open("howto");
    TKB.later(0.6, () => howto.classList.add("is-opened"));
  };
  document.getElementById("t-help").addEventListener("click", (e) => {
    e.preventDefault();
    openHowto(4);
  });

  // ── Start Flow ──
  const showStages = () => {
    const btns = page.btns;
    TKB.later(0.5, () => btns[0].classList.add("is-on"));
    TKB.later(0.9, () => btns[1].classList.add("is-on"));
    TKB.later(1.1, () => btns[2].classList.add("is-on"));
  };
  TKB.onModal.push((what, id) => {
    if (what !== "close") return;
    if (id === "howto") howto.classList.remove("is-opened");
    if (page?.started) showStages();
  });

  // ── Logo eye: rests 1–3s, then does one of look around · lick · blink · double blink, then again 3–12s ──
  const looks = ["is-look-around", "is-licking", "is-blink", "is-double-blink"];
  const blinks = (pg = page) => {
    if (pg !== page) return;
    pg.eyes.classList.remove(...looks);
    gsap.delayedCall(Math.random() * 2 + 1, () => {
      pg.eyes.classList.add(looks[Math.floor(Math.random() * 4)]);
      gsap.delayedCall(Math.random() * 9 + 3, () => blinks(pg));
    });
  };

  // ── First reveal (original start("top")): set up the image → .1s circle unfolds → .1s logo → 3D wobble after 1.05s → start button → .5s credits · two blinks.
  // Even when the same first page container re-enters via barba, hook up fresh to that container ──
  const boot = (container) => {
    const q = (sel) => container.querySelector(sel);
    page?.ctx.kill();
    page?.mm.kill();
    page?.hammer?.destroy();
    page = {
      container,
      drag: q("#t-map-drag"),
      map: q("#t-map"),
      btns: [...container.querySelectorAll(".t-stagebtn")],
      eyes: q("#t-logo-eyes"),
      started: false,
      dragOn: false,
      ctx: gsap.context(() => {}),
      mm: gsap.matchMedia(),
    };
    defscale = nowscale = 1;
    drawTown(q("#t-art"));
    container.querySelectorAll(".t-room").forEach(drawRoom);
    sizeMap();
    const topInner = q("#t-top-inner");
    topInner.classList.add("is-on");
    q("#t-start").addEventListener("click", (e) => {
      e.preventDefault();
      page.started = true;
      if (localStorage.getItem("t-tkb-first") !== "1") {
        localStorage.setItem("t-tkb-first", "1");
        openHowto(0);
      } else {
        showStages();
        TKB.menu(true);
      }
      page.dragOn = true;
      startDrag();
      topInner.classList.add("is-done");
    });
    const logo = q("#t-logo");
    const wrap = q("#t-logo-wrap");
    const startWrap = q("#t-start-wrap");
    const credit = q("#t-credit");
    page.mm.add("(prefers-reduced-motion: no-preference)", () => {
      page.ctx.add(() => {
        gsap.timeline()
          .add(() => TKB.reveal(container), 0.1)
          .add(() => logo.classList.add("is-on"), 0.2)
          .to(wrap, { rotationX: -8, rotationY: -3, duration: 0.1 }, 1.25)
          .to(wrap, { rotationX: 0, rotationY: 0, duration: 0.2 })
          .to(wrap, { rotationY: -6, duration: 0.1 })
          .to(wrap, { rotationX: 0, rotationY: 0, duration: 0.2 })
          .to(wrap, { rotationX: 8, rotationY: -3, duration: 0.1 })
          .to(wrap, { rotationX: 0, rotationY: 0, duration: 0.4 })
          .add(() => startWrap.classList.add("is-on"))
          .add(() => { page.eyes.classList.add("is-double-blink"); credit.classList.add("is-on"); }, "+=0.5")
          .add(() => blinks(), "+=2.5");
      });
    });
    page.mm.add("(prefers-reduced-motion: reduce)", () => {
      TKB.reveal(container);
      logo.classList.add("is-on");
      startWrap.classList.add("is-on");
      credit.classList.add("is-on");
    });
  };

  TKB.pages.top = boot;
  // Start after the logo font has loaded so the type doesn’t swap at the moment it pops in
  Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]).then(TKB.start);
})();
