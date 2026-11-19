// Builds the data to run five logo hovers and the footer thumbs-up hand with lottie-web.
// Panel size, fps, length, frames where layers turn on, keyframe positions and curves are values measured from the original Lottie as they are, and the artwork is ours
// (Letters are a rounded single-stroke BRAND, the hand is a newly drawn thumb hand). Color reads the text color (currentColor) where it is attached and fills.
(() => {
  const K = 0.5523;
  const st = (k) => ({ a: 0, k });
  const anim = (keys) => ({ a: 1, k: keys });
  // Original curve (o.x, o.y, i.x, i.y)
  const kf = (t, s, e) => (e ? { t, s, o: { x: [e[0]], y: [e[1]] }, i: { x: [e[2]], y: [e[3]] } } : { t, s });
  const ks = (p, s = [100, 100, 100], extra = {}) => ({ o: st(100), r: st(0), p: p.a === 1 ? p : st(p), a: st([0, 0, 0]), s: s.a === 1 ? s : st(s), ...extra });
  const tr = (o = {}) => ({ ty: "tr", p: st(o.p || [0, 0]), a: st([0, 0]), s: st(o.s || [100, 100]), r: st(o.r || 0), o: st(100), sk: st(o.sk || 0), sa: st(0) });
  const shapeLayer = (nm, shapes, o) => ({ ddd: 0, ty: 4, nm, sr: 1, ao: 0, bm: 0, st: 0, ip: o.ip ?? 0, op: o.op, ks: o.ks, shapes, ...(o.tt ? { tt: o.tt } : {}), ...(o.td ? { td: 1 } : {}) });
  const comp = (nm, fr, op, w, h, layers, assets = []) => ({ v: "5.7.0", nm, fr, ip: 0, op, w, h, ddd: 0, assets, markers: [], layers: layers.map((l, i) => ({ ind: i + 1, ...l })) });

  // Node [x, y, in handle, out handle] → lottie path
  const path = (nodes, c = false) => ({ ty: "sh", ks: st({ c, v: nodes.map((n) => [n[0], n[1]]), i: nodes.map((n) => n[2] || [0, 0]), o: nodes.map((n) => n[3] || [0, 0]) }) });

  // ── Letters: height 414 units (original logo letter height), center line drawn at weight 100 ──
  const Y = 157;
  const GLYPH = {
    B: [
      [[-117, -Y], [-117, Y]],
      [[-117, -Y], [25, -Y, 0, [41, 0]], [100, -78.5, [0, -43], [0, 43]], [25, 0, [41, 0]], [-117, 0]],
      [[-117, 0], [35, 0, 0, [45, 0]], [117, 78.5, [0, -43], [0, 43]], [35, Y, [45, 0]], [-117, Y]],
    ],
    R: [
      [[-117, -Y], [-117, Y]],
      [[-117, -Y], [30, -Y, 0, [48, 0]], [117, -72, [0, -47], [0, 47]], [30, 13, [48, 0]], [-117, 13]],
      [[20, 13], [117, Y]],
    ],
    A: [
      [[-130, Y], [0, -Y], [130, Y]],
      [[-87.8, 55], [87.8, 55]],
    ],
    N: [[[-117, Y], [-117, -Y], [117, Y], [117, -Y]]],
    D: [[[-117, -Y], [5, -Y, 0, [62, 0]], [117, 0, [0, -87], [0, 87]], [5, Y, [62, 0]], [-117, Y], [-117, -Y]]],
  };
  const WORD = ["B", "R", "A", "N", "D"];
  const HALF = { B: 167, R: 167, A: 184, N: 167, D: 167 };
  const STYLE = {
    main: { w: 100, lc: 2, lj: 2 },
    bubble: { w: 132, lc: 2, lj: 2 },
    light: { w: 34, lc: 2, lj: 2 },
    stencil: { w: 92, lc: 1, lj: 1, dash: [44, 20] },
    slant: { w: 100, lc: 2, lj: 2, sk: -15 },
    sharp: { w: 104, lc: 3, lj: 3 },
    narrow: { w: 112, lc: 2, lj: 2, sx: 78 },
    blob: { w: 150, lc: 2, lj: 2 },
  };
  const glyphGroup = (ch, style, ink) => {
    const s = STYLE[style];
    const strokes = GLYPH[ch].map((sub) => path(sub, ch === "D"));
    const stroke = { ty: "st", c: st([...ink, 1]), o: st(100), w: st(s.w), lc: s.lc, lj: s.lj, ml: 4 };
    if (s.dash) stroke.d = [{ n: "d", nm: "dash", v: st(s.dash[0]) }, { n: "g", nm: "gap", v: st(s.dash[1]) }, { n: "o", nm: "offset", v: st(0) }];
    return { ty: "gr", nm: ch, it: [...strokes, stroke, tr({ s: [s.sx || 100, 100], sk: s.sk || 0 })] };
  };
  // Same spot as the original logo letter line: 985×360 plate, letters 42%, line center y 191.9, left end 89.7 · right end 896
  const SCALE = 42, BASE_Y = 191.908, LEFT = 89.7, GAP = 22.75;
  const slots = (order) => {
    const xs = [];
    let x = LEFT;
    order.forEach((ch) => { const h = (HALF[ch] * SCALE) / 100; xs.push(x + h); x += h * 2 + GAP; });
    return xs;
  };
  const HOME = slots(WORD);

  // When used as SVG (nav logo, footer wordmark)
  const svgD = (sub, close) => sub.map((n, i) => {
    if (!i) return `M${n[0]} ${n[1]}`;
    const p = sub[i - 1], o = p[3] || [0, 0], inn = n[2] || [0, 0];
    return o[0] || o[1] || inn[0] || inn[1] ? `C${p[0] + o[0]} ${p[1] + o[1]} ${n[0] + inn[0]} ${n[1] + inn[1]} ${n[0]} ${n[1]}` : `L${n[0]} ${n[1]}`;
  }).join("") + (close ? "Z" : "");
  const glyphD = (ch) => GLYPH[ch].map((sub) => svgD(sub, ch === "D")).join("");

  const letterLayer = (ch, i, ink, o) => shapeLayer(ch, [glyphGroup(ch, o.style || "main", ink)], {
    ip: o.ip, op: o.op, tt: o.tt,
    ks: ks(o.p || [HOME[i], BASE_Y, 0], o.s || [SCALE, SCALE, 100]),
  });
  // Move the original keyframes into our text slots — values are exactly how much it moved from the first key (delta)
  const moveX = (i, ts, dx, eases) => anim(ts.map((t, k) => kf(t, [HOME[i] + dx[k], BASE_Y, 0], eases[k])));

  const LOGO = {
    // Bump: 91 frames at 60fps — center text stays put while both sides get pushed away and bounce back
    bump(ink) {
      const T = [0, 17, 41, 66.054, 89.999];
      const E = [[0.71, 0, 0.33, 1], [0.9, 0, 0.1, 1], [0.51, 0, 0.46, 1], [0.61, 0, 0.28, 1]];
      const D = [[0, 33, -93, 24, 0], [0, 17, -36, 10, 0], null, [0, -25, 44, -10, 0], [0, -46, 81, -21, 0]];
      return comp("bump", 60, 91, 985, 360, WORD.map((ch, i) => letterLayer(ch, i, ink, { op: 91, p: D[i] ? moveX(i, T, D[i], E) : null })).reverse());
    },
    // Squish: 51 frames — letters flatten (52·9%) then elongate (38·47%) before settling in place
    squish(ink) {
      const T = [0, 15, 33, 50];
      const E = [[1, 0, 0, 1], [0.49, 0, 0.54, 1], [0.45, 0, 0.49, 1]];
      const D = [[0, -20, 23, 0], [0, -4, 11, 0], [0, 0, -3, 0], [0, 11, -19, 0], [0, 23, -31, 0]];
      const S = anim([kf(0, [42, 42, 100], E[0]), kf(15, [52, 9, 100], E[1]), kf(33, [38, 47, 100], E[2]), kf(50, [42, 42, 100])]);
      return comp("squish", 60, 51, 985, 360, WORD.map((ch, i) => letterLayer(ch, i, ink, { ip: -22, op: 69, p: moveX(i, T, D[i], E), s: S })));
    },
    // Scroll: 69 frames — letters drop down at 2-frame intervals (45 frames) and from frame 10 new letters fall from above. Masked by the letter line box
    scroll(ink) {
      const e = [0.95, 0, 0.05, 1];
      const DROP = [-281, -311, -311, -291, -291];
      const matte = shapeLayer("matte", [{ ty: "gr", it: [{ ty: "rc", d: 1, p: st([0, 0]), r: st(0), s: st([861, 178.9]) }, { ty: "fl", c: st([...ink, 1]), o: st(100), r: 1 }, tr()] }], { op: 69, td: true, ks: ks([481.754, 190.367, 0]) });
      const fresh = WORD.map((ch, i) => letterLayer(ch, i, ink, { ip: 10, op: 69, tt: 1, p: anim([kf(10 + i * 2, [HOME[i], BASE_Y + DROP[i], 0], e), kf(55 + i * 2, [HOME[i], BASE_Y, 0])]) }));
      const old = WORD.map((ch, i) => letterLayer(ch, i, ink, { op: 69, tt: 1, p: anim([kf(i * 2, [HOME[i], BASE_Y, 0], e), kf(45 + i * 2, [HOME[i], BASE_Y + 300, 0])]) }));
      // Like the original, one mask layer (ind 1) is used by all the text layer columns as their mask parent (tp 1)
      return comp("scroll", 60, 69, 985, 360, [matte, ...[...fresh.reverse(), ...old.reverse()].map((l) => ({ ...l, tp: 1 }))]);
    },
    // Letters: 35 frames — shuffle letter positions every 5 frames, and the last 5 frames land in the correct order
    letters(ink) {
      const ORDERS = [[1, 0, 2, 3, 4], [1, 0, 3, 2, 4], [1, 4, 0, 3, 2], [2, 3, 1, 4, 0], [3, 4, 0, 1, 2], [0, 1, 4, 3, 2], [0, 1, 2, 3, 4]];
      const layers = [];
      ORDERS.forEach((ord, k) => {
        const chars = ord.map((i) => WORD[i]);
        const xs = slots(chars);
        chars.forEach((ch, j) => layers.push(letterLayer(ch, 0, ink, { ip: k * 5, op: k * 5 + 5, p: [xs[j], BASE_Y, 0] })));
      });
      return comp("letters", 60, 35, 985, 360, layers.reverse());
    },
    // Diff: 70 frames — seven logo types swapped in every 10 frames
    diff(ink) {
      const LOOKS = ["bubble", "light", "stencil", "slant", "sharp", "narrow", "blob"];
      const layers = LOOKS.map((look, k) => shapeLayer(look, WORD.map((ch, i) => {
        const g = glyphGroup(ch, look, ink);
        g.it[g.it.length - 1] = tr({ p: [HOME[i], BASE_Y], s: [(SCALE * (STYLE[look].sx || 100)) / 100, SCALE], sk: STYLE[look].sk || 0 });
        return g;
      }), { ip: k * 10, op: k * 10 + 10, ks: ks([0, 0, 0]) }));
      return comp("diff", 60, 70, 985, 360, layers.reverse());
    },
  };

  // Thumb interaction: 400×300 sheet, 8fps, 35 frames. Frames 0–15 loop a blink (15 images, 1 frame each),
  //    Changes from frame 14.111 (24 images, 0.889 frames each) — frame counts and spacing of the two original groups (precomp) kept as they are ──
  const rnd = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  const circle = (cx, cy, r) => [[cx, cy - r, [-r * K, 0], [r * K, 0]], [cx + r, cy, [0, -r * K], [0, r * K]], [cx, cy + r, [r * K, 0], [-r * K, 0]], [cx - r, cy, [0, r * K], [0, -r * K]]];
  const pill = (x, y, w, h) => {
    const r = Math.min(w, h) / 2, k = r * K;
    return [[x + r, y, [-k, 0], 0], [x + w - r, y, 0, [k, 0]], [x + w, y + r, [0, -k], 0], [x + w, y + h - r, 0, [0, k]], [x + w - r, y + h, [k, 0], 0], [x + r, y + h, 0, [-k, 0]], [x, y + h - r, [0, k], 0], [x, y + r, 0, [0, -k]]];
  };
  const halfDisc = (cx, cy, r) => [[cx - r, cy, 0, [0, r * K * 1.1]], [cx, cy + r, [-r * K, 0], [r * K, 0]], [cx + r, cy, [0, r * K * 1.1], 0]];
  // One picture = Stroke group (width 7, round caps) + fill group. The boil effect shakes vertices by ±1.6 with a different seed for each frame
  const drawing = (seed, lines, fills, ink, xf = (p) => p) => {
    const j = rnd(seed * 7919 + 13);
    const mv = (nodes) => nodes.map((n) => { const [x, y] = xf([n[0] + j() * 1.6, n[1] + j() * 1.6]); return [x, y, n[2], n[3]]; });
    const it = [];
    lines.forEach(([nodes, c]) => it.push(path(mv(nodes), c)));
    it.push({ ty: "st", c: st([...ink, 1]), o: st(100), w: st(7), lc: 2, lj: 2, ml: 4 });
    const g = [{ ty: "gr", it: [...it, tr()] }];
    if (fills.length) g.push({ ty: "gr", it: [...fills.map((n) => path(mv(n), true)), { ty: "fl", c: st([...ink, 1]), o: st(100), r: 1 }, tr()] });
    return g;
  };
  const turn = (deg, sx = 1, sy = 1, px = 200, py = 200) => ([x, y]) => {
    const a = (deg * Math.PI) / 180, dx = (x - px) * sx, dy = (y - py) * sy;
    return [px + dx * Math.cos(a) - dy * Math.sin(a), py + dx * Math.sin(a) + dy * Math.cos(a)];
  };
  // Thumb hand: sleeve, palm, three fingers, thumb pointing up, an eye on the thumb tip (one line when closed)
  const hand = (eye) => {
    const lines = [[pill(130, 142, 22, 92), true], [pill(150, 128, 66, 112), true], [pill(196, 132, 66, 32), true], [pill(196, 166, 66, 32), true], [pill(196, 200, 66, 32), true], [pill(170, 60, 36, 82), true]];
    const fills = [];
    if (eye === "open") { lines.push([circle(188, 84, 10), true]); fills.push(halfDisc(188, 84, 10)); }
    else if (eye === "half") { lines.push([circle(188, 84, 10), true]); fills.push(halfDisc(188, 80, 10)); }
    else lines.push([[[178, 86], [188, 90, [-5, 0], [5, 0]], [198, 86]], false]);
    return { lines, fills };
  };
  const cloud = (rot, puff) => {
    const lines = [];
    for (let k = 0; k < 6; k++) {
      const a = ((k * 60 + rot) * Math.PI) / 180;
      lines.push([circle(200 + Math.cos(a) * 46 * puff, 156 + Math.sin(a) * 34 * puff, 30 * puff), true]);
    }
    return { lines, fills: [halfDisc(176, 214, 11), halfDisc(224, 214, 11)] };
  };
  const THUMB = (ink) => {
    const BLINK = ["open", "open", "open", "open", "open", "open", "open", "open", "half", "shut", "shut", "half", "open", "open", "open"];
    const blink = BLINK.map((eye, k) => { const h = hand(eye); return shapeLayer(`blink ${k}`, drawing(k + 1, h.lines, h.fills, ink), { ip: k, op: k + 1, ks: ks([0, 0, 0]) }); });
    const steps = [];
    const push = (shape, xf) => steps.push({ shape, xf });
    push(hand("open"), turn(-8)); push(hand("open"), turn(-14)); push(hand("half"), turn(-6));
    push(hand("shut"), turn(0, 1.12, 0.84)); push(hand("open"), turn(4, 0.9, 1.14));
    const burst = { lines: [...Array(8)].map((_, k) => { const a = (k * 45 * Math.PI) / 180; return [[[200 + Math.cos(a) * 40, 156 + Math.sin(a) * 40], [200 + Math.cos(a) * 78, 156 + Math.sin(a) * 78]], false]; }).concat([[circle(200, 156, 16), true]]), fills: [] };
    push(burst); push(burst, turn(20, 1.2, 1.2, 200, 156));
    for (let k = 0; k < 9; k++) push(cloud(k * 7, 1 + Math.sin(k) * 0.04));
    push(cloud(70, 0.8)); push(cloud(80, 0.6));
    const pills = { lines: [[pill(150, 120, 40, 96), true], [pill(214, 120, 40, 96), true]], fills: [pill(150, 178, 40, 38), pill(214, 178, 40, 38)] };
    push(pills, turn(-12, 1, 1, 200, 168)); push(pills, turn(-4, 1, 1, 200, 168)); push(pills, turn(8, 1, 1, 200, 168));
    push(hand("open"), turn(0, 1.1, 0.86)); push(hand("open"), turn(-3)); push(hand("open"));
    const morph = steps.map((s, k) => shapeLayer(`turn ${k}`, drawing(k + 40, s.shape.lines, s.shape.fills, ink, s.xf), { ip: k * 0.889, op: (k + 1) * 0.889, ks: ks([0, 0, 0]) }));
    const pre = (refId, ip, op) => ({ ddd: 0, ty: 0, nm: refId, refId, sr: 1, ao: 0, bm: 0, w: 400, h: 300, ip, op, st: ip, ks: ks([0, 0, 0]) });
    return comp("thumb", 8, 35, 400, 300, [pre("turn", 14.111, 35.444), pre("blink", 0, 15)], [
      { id: "blink", layers: blink.reverse().map((l, i) => ({ ind: i + 1, ...l })) },
      { id: "turn", layers: morph.reverse().map((l, i) => ({ ind: i + 1, ...l })) },
    ]);
  };

  // Text color at the attach spot → lottie color (0~1)
  const inkOf = (el) => (getComputedStyle(el).color.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map((v) => +v / 255);

  window.MN_LOTTIE = { LOGO, THUMB, WORD, HOME, BASE_Y, SCALE, HALF, glyphD, inkOf };
})();
