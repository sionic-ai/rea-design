// Rebuild the hand-drawn village and character spots the original drew with Lottie (lottie-web 5.12.2) in our own shapes — the original JSON is not used.
// Panel size, frames (60fps) and length match the original art, and the fill uses gray numbers + class (f-<Name>) only, so shared.css paints it with --site-*.
// To run even on file://, builds animationData here instead of using a JSON file.
(() => {
  const FR = 60;
  const st = (v) => ({ a: 0, k: v });
  const GRAY = [0.5, 0.5, 0.5, 1];
  // A repeating keyframe that cycles through a list of values at equal intervals — it must end on the first value so no seam shows
  const keys = (vals, step, start = 0) => ({
    a: 1,
    k: vals.map((v, i) => (i < vals.length - 1
      ? { t: start + i * step, s: [].concat(v), o: { x: [0.42], y: [0] }, i: { x: [0.58], y: [1] } }
      : { t: start + i * step, s: [].concat(v) })),
  });
  const swing = (a, b, half, total) => { const v = []; for (let t = 0, k = 0; t <= total; t += half, k++) v.push(k % 2 ? b : a); return keys(v, half); };
  const tr = (o = {}) => ({ ty: "tr", p: o.p || st(o.at || [0, 0]), a: st(o.a || o.at || [0, 0]), s: o.s || st([100, 100]), r: o.r || st(0), o: o.o || st(100), sk: st(0), sa: st(0) });
  const fill = (c, op = 100) => ({ ty: "fl", c: st(GRAY), o: st(op), r: 1, cl: "f-" + c });
  const stroke = (c, w) => ({ ty: "st", c: st(GRAY), o: st(100), w: st(w), lc: 2, lj: 2, ml: 4, cl: "s-" + c });
  const E = (x, y, w, h) => ({ ty: "el", p: st([x, y]), s: st([w, h]), d: 1 });
  const R = (x, y, w, h, r = 0) => ({ ty: "rc", p: st([x + w / 2, y + h / 2]), s: st([w, h]), r: st(r), d: 1 });
  const P = (pts, closed = true) => ({ ty: "sh", ks: st({ i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]), v: pts, c: closed }) });
  const arc = (cx, cy, rx, ry, a0, a1, n = 18) => { const p = []; for (let k = 0; k <= n; k++) { const a = a0 + ((a1 - a0) * k) / n; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; };
  const half = (cx, cy, rx, ry) => P(arc(cx, cy, rx, ry, Math.PI, Math.PI * 2));
  // Takes the drawing order (back→front) and reverses it into Lottie order (front on top)
  const G = (kids, o = {}) => ({ ty: "gr", nm: o.nm || "g", it: [...kids.filter(Boolean).reverse(), tr(o)] });
  const part = (c, ...geo) => ({ ty: "gr", nm: c, it: [...geo, fill(c), tr()] });
  const soft = (c, op, ...geo) => ({ ty: "gr", nm: c, it: [...geo, fill(c, op), tr()] });
  const line = (c, w, ...geo) => ({ ty: "gr", nm: c, it: [...geo, stroke(c, w), tr()] });
  const place = (x, y, s, kids, o = {}) => G(kids, { p: o.p || st([x, y]), s: st([s * 100 * (o.flip ? -1 : 1), s * 100]), r: o.r });
  const bobKeys = (x, y, amp, half, total) => swing([x, y], [x, y - amp], half, total);
  const doc = (nm, w, h, op, shapes) => ({ v: "5.12.2", fr: FR, ip: 0, op, w, h, nm, ddd: 0, assets: [],
    layers: [{ ddd: 0, ind: 1, ty: 4, nm, sr: 1, ao: 0, ip: 0, op, st: 0, bm: 0, ks: { o: st(100), r: st(0), p: st([0, 0, 0]), a: st([0, 0, 0]), s: st([100, 100, 100]) }, shapes: [G(shapes)] }] });

  // ── Parts ──
  // Person: center of the feet is (0,0), height 200. o: hair·top·bottom·cap·vest·glasses·wave·walk·flag·bag·kid·bun
  function person(o = {}) {
    const T = o.total || 300, top = o.top || "white", bottom = o.bottom || "tree", hair = o.hair || "navy";
    const legs = o.walk
      ? [G([part(bottom, R(-17, -72, 15, 64, 7)), part("navy", E(-10, -6, 20, 12))], { at: [-10, -70], r: swing(14, -14, 30, T) }),
         G([part(bottom, R(2, -72, 15, 64, 7)), part("navy", E(10, -6, 20, 12))], { at: [10, -70], r: swing(-14, 14, 30, T) })]
      : [part(bottom, R(-17, -72, 15, 66, 7), R(2, -72, 15, 66, 7)), part("navy", E(-11, -5, 20, 11), E(11, -5, 20, 11))];
    const arm = (side) => {
      const sx = side * 27, raise = o.wave === side;
      const kids = [part(top, R(sx - 7, -128, 14, 54, 7)), part("skin", E(sx, -74, 15, 15))];
      if (o.flag === side) kids.push(line("ink", 3, P([[sx, -74], [sx, -150]], false)), part("orange", P([[sx, -150], [sx + side * 40, -136], [sx, -122]])));
      const r = raise ? swing(side * 150, side * 120, 18, T) : o.flag === side ? swing(side * 30, side * 10, 75, T) : st(side * 8);
      return G(kids, { at: [sx, -124], r });
    };
    const body = [
      part(top, R(-28, -136, 56, 74, 22)),
      o.vest && part(o.vest, R(-27, -132, 54, 50, 16)),
      o.vest && soft("white", 90, R(-27, -112, 54, 6, 3)),
      o.bag && part("white", E(side(o.bag) * 38, -84, 34, 40)),
    ];
    const head = [
      o.bun && part(hair, E(0, -214, 26, 22)),
      part(hair, E(0, -176, 70, 66)),
      part("skin", E(0, -166, 60, 58)),
      o.cap ? part(o.cap, half(0, -176, 36, 32), R(-38, -180, 76, 8, 4)) : part(hair, half(0, -176, 35, 28), E(-26, -168, 12, 26), E(26, -168, 12, 26)),
      part("ink", E(-12, -164, 6, 9), E(12, -164, 6, 9)),
      soft("orange", 45, E(-20, -152, 12, 7), E(20, -152, 12, 7)),
      part("orange", P(arc(0, -152, 7, 6, 0, Math.PI, 8))),
      o.glasses && line("navy", 2.5, E(-12, -164, 17, 17), E(12, -164, 17, 17)),
    ];
    const headG = G(head, { at: [0, -140], r: swing(-3, 3, 75, T) });
    return [...legs, arm(-1), ...body, arm(1), headG];
  }
  const side = (v) => (v === "l" ? -1 : 1);
  // Guard puppy (mascot): center of the feet at (0,0), height 200
  function mascot(o = {}) {
    const T = o.total || 300;
    const handR = o.wave ? swing(-150, -115, 15, T) : st(-20);
    return [
      o.cape !== false && G([part("orange", P([[-20, -120], [44, -96], [30, -40], [-6, -60]]))], { at: [-10, -110], r: swing(0, -6, 30, T) }),
      part("dog", R(-16, -52, 13, 52, 6), R(3, -52, 13, 52, 6)),
      part("orange", E(-10, -4, 22, 12), E(10, -4, 22, 12)),
      part("dog", R(-34, -118, 68, 76, 28)),
      part("navy", R(-34, -66, 68, 12, 6)),
      part("orange", P([[-8, -60], [8, -60], [0, -48]])),
      G([part("dog", R(-46, -116, 13, 46, 6)), part("navy", E(-40, -70, 16, 16))], { at: [-40, -112], r: st(20) }),
      G([part("dog", R(33, -116, 13, 46, 6)), part("navy", E(40, -70, 16, 16))], { at: [40, -112], r: handR }),
      G([
        part("dog", E(-46, -170, 34, 46), E(46, -170, 34, 46)),
        part("dog", E(0, -160, 96, 84)),
        part("orange", half(0, -170, 50, 46), R(-52, -176, 104, 10, 5)),
        part("white", R(-4, -214, 8, 40, 4)),
        line("navy", 3, P([[0, -214], [0, -232]], false)), part("navy", E(0, -236, 10, 10)),
        part("navy", R(-46, -178, 92, 26, 13)),
        part("tree", R(-38, -174, 34, 18, 9), R(4, -174, 34, 18, 9)),
        part("white", E(0, -132, 40, 28)),
        part("ink", E(0, -140, 12, 8), E(-18, -152, 6, 8), E(18, -152, 6, 8)),
      ], { at: [0, -120], r: swing(-4, 4, 60, T) }),
    ];
  }
  const smallDog = (o = {}) => [
    G([part("white", P([[30, -34], [46, -48], [40, -30]]))], { at: [32, -32], r: swing(-12, 12, 12, o.total || 300) }),
    part("white", R(-28, -16, 8, 16, 4), R(-12, -16, 8, 16, 4), R(10, -16, 8, 16, 4), R(24, -16, 8, 16, 4)),
    part("white", E(0, -28, 72, 34)),
    part(o.vest || "yellow", R(-10, -42, 24, 26, 8)),
    part("white", E(-34, -46, 34, 30)),
    part("white", E(-46, -54, 12, 18), E(-24, -56, 12, 18)),
    part("ink", E(-38, -48, 4, 5), E(-50, -42, 5, 4)),
  ];
  const cat = () => [part("gray", E(0, -26, 44, 50), R(-24, -12, 12, 12, 6), E(18, -60, 30, 28), P([[6, -70], [10, -86], [18, -72]]), P([[22, -72], [30, -86], [32, -68]])), line("gray", 5, P([[-18, -12], [-36, -24], [-34, -48]], false)), part("ink", E(14, -62, 4, 5), E(24, -62, 4, 5))];
  function tree(h = 1) {
    return [
      part("orange", P([[-14, 0], [-8, -110 * h], [8, -110 * h], [14, 0]]), P([[-6, -80 * h], [-26, -110 * h], [-20, -114 * h], [-2, -92 * h]])),
      part("tree", E(0, -150 * h, 150, 140 * h), E(-44, -122 * h, 76, 70 * h), E(44, -122 * h, 76, 70 * h), E(0, -214 * h, 110, 70 * h)),
      soft("navy", 35, E(-30, -170 * h, 8, 20), E(34, -150 * h, 8, 20)),
    ];
  }
  function building(w, h, look = "tree", win = "white", cols = 2, rows = 4) {
    const wins = [], gw = w / (cols * 2 + 1), gh = Math.min(26, h / (rows * 2 + 1));
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) wins.push(R(gw * (1 + c * 2) - w / 2, -h + gh * (1 + r * 2), gw, gh, 2));
    return [part(look, R(-w / 2, -h, w, h, 2)), part(win, ...wins)];
  }
  const tower = () => [
    part("orange", P([[-66, 0], [-8, -230], [8, -230], [66, 0], [46, 0], [0, -150], [-46, 0]]), R(-3, -262, 6, 40, 3)),
    part("white", R(-30, -120, 60, 12, 2), R(-16, -184, 32, 10, 2), R(-6, -242, 12, 8, 2)),
    part("orange", R(-42, -96, 84, 10, 2), R(-22, -160, 44, 10, 2)),
  ];
  const cloud = (w = 1) => [part("white", E(0, 0, 200 * w, 50), E(-50 * w, -12, 90 * w, 46), E(30 * w, -16, 110 * w, 50))];
  const bird = () => [part("white", P([[-20, 0], [0, -4], [24, -18], [10, 2], [20, 8], [-4, 8]]))];
  const flower = () => [line("grassdeep", 3, P([[0, 0], [0, -30]], false)), part("white", E(-7, -36, 12, 12), E(7, -36, 12, 12), E(-5, -46, 12, 12), E(5, -46, 12, 12), E(0, -30, 12, 12)), part("yellow", E(0, -40, 9, 9))];
  const car = (look = "orange", police = false) => [
    part(look, R(-70, -46, 140, 34, 14), R(-44, -72, 88, 32, 14)),
    police && part("navy", R(-70, -30, 140, 10, 4)),
    police && part("orange", R(-8, -82, 16, 10, 4)),
    part("sky", R(-36, -66, 32, 20, 6), R(4, -66, 32, 20, 6)),
    part("ink", E(-40, -12, 28, 28), E(40, -12, 28, 28)),
    part("gray", E(-40, -12, 12, 12), E(40, -12, 12, 12)),
  ];
  const plane = () => [part("white", P([[-60, 10], [60, -30], [-10, 30]])), part("gray", P([[-10, 30], [60, -30], [0, 14]]))];
  const bench = () => [part("yellowdeep", R(-90, -64, 180, 16, 4), R(-90, -44, 180, 16, 4), R(-96, -22, 192, 14, 4)), part("brown", R(-80, -10, 10, 24, 2), R(70, -10, 10, 24, 2))];
  const pin = (c = "orange") => [part(c, E(0, -24, 30, 30), P([[-13, -18], [0, 0], [13, -18]])), part("white", E(0, -24, 12, 12))];

  // ── Scenes ── original panel size · length unchanged (original names kept only as data-lottieillust values)
  const S = {};
  // Hero village 1700×804, 5s (300f): the original screen positions moved into board coordinates (at 1440 width the board is 1.017×, 144px cropped on each side)
  S.home_mv_pc = () => {
    const T = 300, k = [];
    k.push(part("sky", R(0, 0, 1700, 440)));
    [[495, 255, 1.1, 6], [1205, 216, 0.6, 5], [520, 310, 0.5, 4], [1600, 190, 0.7, 5], [80, 150, 0.6, 4]].forEach(([x, y, w, d]) =>
      k.push(G(cloud(w), { p: swing([x, y], [x + 16 * d, y], 180, T * 1.2), s: st([100, 100]) })));
    k.push(G(bird(), { p: swing([1050, 236], [1062, 228], 30, T) }));
    k.push(place(296, 423, 1, building(84, 98, "tree", "white", 2, 3)), place(815, 423, 1, building(108, 118, "tree", "white", 2, 3)));
    k.push(place(942, 423, 1, tower()));
    k.push(place(1204, 423, 1, building(100, 124, "white", "navy", 1, 4)), place(1297, 423, 1, building(80, 164, "road", "navy", 2, 5)));
    k.push(place(1383, 423, 1, building(74, 252, "white", "navy", 2, 7)), place(1474, 423, 1, building(70, 252, "white", "navy", 2, 7)));
    k.push(place(1560, 423, 1, building(90, 96, "tree", "white", 2, 3)), place(1650, 423, 1, building(70, 140, "white", "navy", 2, 4)), place(100, 423, 1, building(80, 120, "white", "navy", 2, 4)));
    k.push(part("grass", R(0, 420, 1700, 384)));
    k.push(part("road", R(0, 428, 1700, 22)), part("road", P([[712, 804], [830, 450], [1700, 450], [1700, 804]])));
    for (let s = 0; s < 6; s++) { const x = 1160 + s * 92; k.push(part("white", P([[x, 470], [x + 46, 470], [x + 70 + s * 6, 790], [x + 18 + s * 6, 790]]))); }
    [[1080, 470], [1062, 520], [1044, 580], [1026, 640], [1500, 470]].forEach(([x, y]) => k.push(part("navy", R(x - 5, y, 10, 44, 5))));
    k.push(place(290, 452, 0.95, car("white", true)), place(1374, 512, 0.95, car("orange")));
    k.push(place(190, 423, 0.95, tree(1)), place(450, 551, 1.05, tree(1.15)), place(652, 570, 1.05, tree(1.15)));
    k.push(G(bird(), { p: swing([640, 374], [640, 368], 20, T), s: st([-100, 100]) }));
    k.push(G(mascot({ total: T, wave: true }), { p: bobKeys(836, 462, 4, 75, T), s: st([44, 44]) }));
    [[218, 480], [36, 660], [570, 670], [910, 520], [120, 760]].forEach(([x, y]) => k.push(place(x, y, 1, flower())));
    k.push(G(person({ total: T, top: "white", vest: "yellow", cap: "yellow", walk: false }), { p: bobKeys(1010, 536, 3, 75, T), s: st([90, 90]) }));
    k.push(G(person({ total: T, top: "white", hair: "navy", bag: "r", bun: true }), { p: bobKeys(1084, 536, 3, 60, T), s: st([88, 88]) }));
    k.push(G(person({ total: T, top: "white", glasses: true, walk: true }), { p: bobKeys(249, 654, 4, 30, T), s: st([100, 100]) }));
    k.push(G(smallDog({ total: T }), { p: bobKeys(312, 659, 3, 30, T), s: st([-90, 90]) }));
    k.push(line("orange", 3, P([[268, 580], [300, 620], [322, 632]], false)));
    k.push(G(person({ total: T, top: "white", bottom: "navy", cap: "yellow", hair: "orange" }), { p: bobKeys(365, 639, 3, 45, T), s: st([52, 52]) }));
    k.push(G(person({ total: T, top: "white", bottom: "navy", cap: "yellow", wave: 1 }), { p: bobKeys(457, 649, 3, 50, T), s: st([59, 59]) }));
    k.push(G(person({ total: T, top: "white", bottom: "navy", hair: "navy", walk: true }), { p: bobKeys(567, 659, 3, 30, T), s: st([-78, 78]) }));
    k.push(G(smallDog({ total: T }), { p: bobKeys(510, 669, 3, 30, T), s: st([80, 80]) }));
    k.push(place(648, 649, 0.9, cat()));
    k.push(G(person({ total: T, top: "yellow", vest: "yellow", glasses: true, wave: -1 }), { p: bobKeys(830, 678, 4, 60, T), s: st([98, 98]) }));
    k.push(G(person({ total: T, top: "tree", bottom: "yellow", hair: "white", glasses: true }), { p: bobKeys(952, 673, 2, 75, T), s: st([83, 83]) }));
    k.push(G(person({ total: T, top: "white", vest: "yellow", hair: "orange", walk: true }), { p: bobKeys(1063, 747, 3, 30, T), s: st([78, 78]) }));
    k.push(G(person({ total: T, top: "white", vest: "tree", wave: -1 }), { p: bobKeys(1291, 659, 4, 60, T), s: st([90, 90]) }));
    k.push(G(person({ total: T, top: "white", vest: "tree", hair: "orange", cap: "tree", flag: 1 }), { p: bobKeys(1410, 669, 3, 75, T), s: st([95, 95]) }));
    k.push(G(person({ total: T, top: "orange", bottom: "white", walk: true }), { p: bobKeys(1335, 767, 3, 30, T), s: st([69, 69]) }));
    k.push(G(person({ total: T, top: "tree", bottom: "white", hair: "navy", wave: 1 }), { p: bobKeys(1428, 757, 3, 50, T), s: st([73, 73]) }));
    k.push(G(person({ total: T, top: "white", vest: "yellow", cap: "yellow", walk: true }), { p: bobKeys(1600, 700, 3, 30, T), s: st([80, 80]) }));
    return doc("home_mv_pc", 1700, 804, T, k);
  };
  // Phone hero 500×550, 5s — like the original portrait panel, with sky, tower and buildings on top and six people on the lawn
  S.home_mv_sp = () => {
    const T = 300, k = [];
    k.push(part("sky", R(0, 0, 500, 300)));
    k.push(G(cloud(0.5), { p: swing([120, 130], [150, 130], 180, T * 1.2) }), G(cloud(0.4), { p: swing([400, 90], [420, 90], 180, T * 1.2) }));
    k.push(place(60, 290, 0.7, building(80, 110, "tree", "white", 2, 3)), place(330, 290, 0.8, tower()));
    k.push(place(430, 290, 0.8, building(70, 220, "white", "navy", 2, 6)), place(160, 290, 0.7, building(90, 80, "white", "navy", 2, 2)));
    k.push(part("grass", R(0, 288, 500, 262)), part("road", R(0, 292, 500, 14)), part("road", P([[260, 550], [330, 306], [500, 306], [500, 550]])));
    for (let s = 0; s < 3; s++) { const x = 360 + s * 50; k.push(part("white", P([[x, 320], [x + 26, 320], [x + 40, 540], [x + 12, 540]]))); }
    k.push(place(70, 310, 0.6, car("white", true)), place(120, 380, 0.7, tree(1)), place(250, 360, 0.6, tree(1)));
    k.push(G(mascot({ total: T, wave: true }), { p: bobKeys(300, 340, 3, 75, T), s: st([26, 26]) }));
    k.push(G(person({ total: T, glasses: true, walk: true }), { p: bobKeys(60, 470, 3, 30, T), s: st([62, 62]) }));
    k.push(G(smallDog({ total: T }), { p: bobKeys(110, 476, 2, 30, T), s: st([-55, 55]) }));
    k.push(G(person({ total: T, cap: "yellow", bottom: "navy", wave: 1 }), { p: bobKeys(170, 480, 2, 50, T), s: st([38, 38]) }));
    k.push(G(person({ total: T, top: "yellow", vest: "yellow", glasses: true, wave: -1 }), { p: bobKeys(260, 500, 3, 60, T), s: st([60, 60]) }));
    k.push(G(person({ total: T, top: "tree", bottom: "yellow", hair: "white" }), { p: bobKeys(330, 496, 2, 75, T), s: st([52, 52]) }));
    k.push(G(person({ total: T, vest: "tree", hair: "orange", cap: "tree", flag: 1 }), { p: bobKeys(430, 500, 3, 75, T), s: st([58, 58]) }));
    k.push(G(person({ total: T, top: "orange", bottom: "white", walk: true }), { p: bobKeys(380, 540, 2, 30, T), s: st([44, 44]) }));
    return doc("home_mv_sp", 500, 550, T, k);
  };
  // Paper plane (300×200, 4s): flies bobbing up and down, with three trail lines flickering behind
  S.home_airplane1 = () => {
    const T = 240;
    const trail = [0, 1, 2].map((n) => G([line("gray", 3, P([[40 + n * 14, 120 + n * 14], [100 + n * 10, 104 + n * 10]], false))], { o: swing(100, 0, 60, T) }));
    return doc("home_airplane1", 300, 200, T, [...trail, G(plane(), { p: keys([[170, 90], [186, 80], [176, 96], [190, 84], [170, 90]], 60), s: swing([100, 100], [104, 104], 120, T) })]);
  };
  S.home_airplane2 = () => doc("home_airplane2", 200, 200, 180, [G(plane(), { p: keys([[100, 100], [108, 92], [100, 100], [92, 106], [100, 100]], 45), r: st(30), s: st([90, 90]) })]);
  S.home_cloud1 = () => doc("home_cloud1", 300, 200, 360, [G(cloud(1), { p: swing([150, 110], [170, 110], 180, 360) }), G(cloud(0.4), { p: swing([60, 150], [44, 150], 180, 360) })]);
  S.home_cloud2 = () => doc("home_cloud2", 200, 100, 360, [G(cloud(0.7), { p: swing([100, 56], [116, 56], 180, 360) })]);
  // Bench couple (260×220, 5s): two people sit and one shakes the phone in their hand
  S.home_cupple_bench = () => {
    const T = 300;
    const sit = (o) => person({ total: T, ...o });
    return doc("home_cupple_bench", 260, 220, T, [place(130, 200, 1, bench()), G(sit({ hair: "orange", top: "tree", bottom: "white" }), { p: bobKeys(96, 196, 2, 75, T), s: st([80, 80]) }), G(sit({ hair: "navy", top: "tree", bottom: "white", wave: -1 }), { p: bobKeys(164, 196, 2, 60, T), s: st([80, 80]) })]);
  };
  // A puppy peeks its head up from below (120×120, 1s, once when entering 90% of the screen)
  S.home_inu_pop = () => doc("home_inu_pop", 120, 120, 60, [G(mascot({ total: 60, cape: false }), { p: keys([[60, 250], [60, 124], [60, 134]], 20), s: st([52, 52]) })]);
  S.home_inu_stand = () => doc("home_inu_stand", 150, 240, 120, [G(mascot({ total: 120 }), { p: bobKeys(75, 236, 4, 30, 120), s: st([90, 90]) })]);
  // A puppy waving beside the signboard (160×220, 2s)
  S.home_inu_shakehand = () => doc("home_inu_shakehand", 160, 220, 120, [G(mascot({ total: 120, wave: true }), { p: st([86, 216]), s: st([80, 80]) })]);
  // Person picking up trash with tongs (300×260, 5s)
  S.home_man_gomipicking = () => {
    const T = 300;
    return doc("home_man_gomipicking", 300, 260, T, [place(60, 250, 0.7, tree(1)), place(250, 250, 0.7, tree(1)),
      G([...person({ total: T, top: "navy", vest: "orange", cap: "orange", bottom: "navy" }), G([line("navy", 6, P([[27, -100], [44, -20]], false))], { at: [27, -100], r: swing(-6, 8, 75, T) }), part("white", E(-46, -60, 40, 54))], { p: st([150, 250]), s: st([95, 95]) })]);
  };
  S.home_oyako_walk = () => {
    const T = 300;
    return doc("home_oyako_walk", 240, 240, T, [G(person({ total: T, top: "orange", hair: "navy", cap: "orange", walk: true }), { p: bobKeys(96, 236, 3, 30, T), s: st([100, 100]) }), G(person({ total: T, top: "orange", bottom: "white", walk: true }), { p: bobKeys(170, 236, 3, 30, T), s: st([62, 62]) })]);
  };
  S.footer_child_stand = () => {
    const T = 300;
    return doc("footer_child_stand", 210, 170, T, [G(person({ total: T, cap: "yellow", bottom: "navy", hair: "orange" }), { p: st([70, 166]), s: st([72, 72]) }), G(person({ total: T, cap: "yellow", bottom: "navy", wave: 1 }), { p: st([146, 166]), s: st([72, 72]) })]);
  };

  // ── Still artwork (original is svg·webp) — kept as a single scene under the same artwork name ──
  const still = (nm, w, h, kids) => doc(nm, w, h, 1, kids);
  S.map_check = () => still("map_check", 200, 200, [place(120, 196, 0.8, person({ top: "white", bottom: "navy", hair: "orange" })), place(60, 130, 1.4, pin("orange")), part("navy", R(116, 70, 30, 44, 6)), part("sky", R(120, 76, 22, 30, 4))]);
  S.map_edit = () => still("map_edit", 200, 200, [place(100, 196, 0.8, person({ top: "tree", hair: "orange" })), place(40, 100, 1, pin("navy")), place(170, 70, 1.2, pin("navy")), part("navy", R(110, 84, 34, 46, 6))]);
  S.map_make = () => still("map_make", 200, 200, [part("tree", P([[10, 190], [60, 140], [190, 140], [150, 190]])), part("white", P([[60, 170], [80, 150], [120, 150], [100, 170]])), place(100, 186, 0.7, person({ cap: "yellow", bottom: "navy", flag: -1 })), place(40, 170, 0.8, pin("orange")), place(170, 160, 0.8, pin("orange"))]);
  S.volunteers = () => still("volunteers", 220, 220, [place(60, 200, 0.85, person({ cap: "yellow", vest: "yellow", glasses: true })), place(160, 200, 0.85, person({ cap: "yellow", vest: "yellow", glasses: true, wave: 1 })), place(110, 216, 0.85, person({ top: "white", vest: "yellow", hair: "navy" }))]);
  S.kids = () => still("kids", 220, 220, [part("white", R(10, 170, 200, 14, 4), R(30, 196, 160, 14, 4)), place(70, 166, 0.7, person({ cap: "yellow", bottom: "navy", hair: "orange" })), place(150, 166, 0.7, person({ cap: "yellow", bottom: "navy" }))]);
  S.opendata = () => still("opendata", 280, 160, [line("tree", 4, P([[40, 20], [80, 70]], false), P([[240, 30], [200, 70]], false), P([[30, 120], [80, 100]], false), P([[250, 130], [200, 110]], false)), part("tree", E(40, 20, 14, 14), E(240, 30, 14, 14), E(30, 120, 14, 14), E(250, 130, 14, 14)), part("navy", R(70, 30, 140, 100, 8), R(50, 128, 180, 12, 6)), part("white", R(80, 40, 120, 80, 4)), part("yellowdeep", R(90, 52, 48, 4, 2), R(90, 62, 48, 4, 2), R(90, 72, 48, 4, 2), R(150, 64, 10, 46, 4), R(166, 80, 10, 30, 4), R(182, 70, 10, 40, 4)), part("orange", R(150, 56, 10, 14, 4))]);
  S.links = () => still("links", 180, 140, [part("gray", R(28, 18, 140, 120, 10)), part("white", R(20, 10, 140, 120, 10)), part("navy", R(20, 10, 140, 20, 8)), part("orange", E(32, 20, 7, 7)), part("yellow", E(44, 20, 7, 7), E(90, 74, 76, 76)), part("tree", E(56, 20, 7, 7)), line("navy", 6, R(72, 64, 26, 16, 8), R(84, 70, 26, 16, 8))]);
  S.archive = () => still("archive", 180, 120, [part("gray", R(10, 70, 100, 40, 6)), part("white", R(6, 60, 100, 10, 3), R(6, 76, 100, 10, 3), R(6, 92, 100, 10, 3)), part("white", R(96, 6, 76, 100, 4)), part("navy", R(104, 16, 60, 5, 2), R(104, 28, 60, 5, 2), R(104, 40, 40, 5, 2), R(96, 60, 76, 40, 2))]);
  S.kanban = () => still("kanban", 260, 220, [part("gray", R(50, 150, 12, 70, 4), R(198, 150, 12, 70, 4)), part("orange", R(118, 0, 24, 14, 4)), part("navy", R(20, 14, 220, 140, 10)), part("white", R(28, 22, 204, 124, 6)), part("ink", R(46, 44, 160, 22, 6), R(46, 84, 120, 22, 6)), part("orange", E(196, 96, 12, 12)), part("tree", E(214, 96, 12, 12))]);
  S.patrolcar = () => still("patrolcar", 160, 90, [place(80, 84, 1, car("white", true))]);
  S.subhead = () => still("subhead", 220, 200, [place(150, 196, 1, tree(1.1)), place(70, 196, 0.6, mascot({}))]);
  S.subhead_kids = () => still("subhead_kids", 220, 200, [place(60, 170, 0.6, tree(0.9)), place(180, 150, 0.6, tree(0.9)), place(100, 196, 0.7, person({ top: "orange", cap: "orange", hair: "navy" })), place(150, 196, 0.5, person({ top: "orange", bottom: "white" }))]);
  S.banner_inu = () => still("banner_inu", 52, 65, [place(28, 64, 0.26, mascot({}))]);
  S.footer_base = () => {
    const k = [];
    [[120, 1], [300, 0.8], [520, 1.2], [760, 0.9], [980, 1.1], [1220, 0.85]].forEach(([x, h], n) => k.push(place(x, 300, 1, building(70 + (n % 3) * 20, 120 * h, "base2", "base", 2, 3))));
    k.push(place(1290, 300, 1.2, tower()), place(90, 300, 1.2, tree(1.1)), place(820, 300, 1, tree(1.1)), place(180, 290, 1, flower()), place(900, 280, 1, flower()));
    return still("footer_base", 1366, 300, k);
  };
  S.icon_run = () => still("icon_run", 90, 90, [place(34, 86, 0.38, person({ top: "orange", cap: "orange", walk: true })), place(62, 86, 0.36, person({ top: "orange", cap: "yellow", walk: true }))]);
  S.icon_wan = () => still("icon_wan", 90, 90, [place(30, 88, 0.4, person({ top: "white", hair: "navy", glasses: true })), place(64, 88, 0.4, smallDog({ vest: "orange" }))]);

  window.bhArt = S;
})();
