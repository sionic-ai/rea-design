// Redraw in our own art the spots where the original speaks with pictures (cat illustration · icons · Lottie).
// SVG symbols are planted once at the very start of the document, and Lottie builds the data to hand to lottie-web here — the original JSON isn’t used, only the canvas size, fps, frame count and playback mode are carried over.
// Head icon 128×140 · 12fps · 24f (cart starts at 11f, My Page at 2f) / Back to top 800×1400 — hover 6fps 15f · catch/miss 29.97fps 150f · phone 6fps 6f
//   shopping tail 450×250 · 12fps · 58f (rests 3 seconds at the end) / FEATURE dots 618×574 · 30fps · 41f / cat playing with a ball (no original file — built as a 30fps 60f loop)
(() => {
  const sns = "var(--sns, var(--kf-ink))", ink = "var(--kf-ink)", acc = "var(--kf-accent)", soft = "var(--kf-accent-soft)", paper = "var(--kf-surface)", dim = "var(--kf-dim)";
  const S = (d, f = paper, s = ink, w = 2.4) => `<path d="${d}" style="fill:${f};stroke:${s};stroke-width:${w};stroke-linecap:round;stroke-linejoin:round"/>`;
  const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">
    <symbol id="mr-cat-sit" viewBox="0 0 120 110">
      ${S("M88 96c18-2 26-14 22-26-3-9-12-10-14-4", "none")}
      ${S("M30 100c-6-20 0-44 22-52l18-2c18 4 26 22 22 54z")}
      ${S("M26 18l6 22M70 18l-4 22", "none")}
      ${S("M22 46c-4-16 2-30 8-32l12 10h14l12-10c8 4 10 18 6 32-4 12-14 18-26 18S26 58 22 46z")}
      ${S("M30 22l10 8c-6 2-10 6-12 12-2-8-1-15 2-20z", soft, "none", 0)}
      ${S("M68 22l-8 8c4 1 8 4 10 8 1-6 0-11-2-16z", acc, "none", 0)}
      ${S("M36 42c2 2 4 2 6 0M56 42c2 2 4 2 6 0", "none", ink, 2.2)}
      ${S("M47 48l2 2 2-2z", acc, acc, 1.6)}
      ${S("M44 100v-10M64 100v-10", "none", ink, 2.2)}
      ${S("M70 70c6 6 8 14 6 24", "none", soft, 6)}
    </symbol>
    <symbol id="mr-cat-lie" viewBox="0 0 220 90">
      ${S("M190 70c22-4 26-26 14-30", "none", ink, 2.6)}
      ${S("M50 86c-4-22 14-38 50-40h50c26 2 40 18 40 40z")}
      ${S("M110 50c10 6 20 6 30 0l6 36h-40z", soft, "none", 0)}
      ${S("M160 54c6 2 12 8 14 14l-14 6z", acc, "none", 0)}
      ${S("M20 52c-4-14 0-28 6-30l10 8h14l10-8c6 4 8 16 4 30-4 10-12 16-22 16S24 62 20 52z")}
      ${S("M27 28l8 6c-5 1-8 4-10 8-1-5 0-10 2-14z", soft, "none", 0)}
      ${S("M30 50c2 2 4 2 6 0M46 50c2 2 4 2 6 0", "none", ink, 2.2)}
      ${S("M39 56l2 2 2-2z", acc, acc, 1.6)}
      ${S("M60 86c6 0 14-2 18-6M150 86c-6 0-12-2-16-6", "none", ink, 2.2)}
    </symbol>
    <symbol id="mr-girl" viewBox="0 0 120 120">
      ${S("M30 118c0-30 12-46 32-46s32 16 32 46", soft)}
      ${S("M40 50c-6-24 6-40 22-40s28 16 22 40c-2 10-10 18-22 18S42 60 40 50z")}
      ${S("M40 44c4-16 14-24 28-22 10 2 16 10 16 22-10-2-20-8-24-16-4 8-12 14-20 16z", ink, ink, 1)}
      ${S("M54 48c2 2 4 2 6 0M68 48c2 2 4 2 6 0", "none", ink, 2)}
      ${S("M44 104c-6-14 4-26 18-26s22 10 18 24z")}
      ${S("M46 80l4-8 4 6M70 78l4-6 3 9", "none", ink, 2)}
      ${S("M52 90c2 2 4 2 6 0M64 90c2 2 4 2 6 0", "none", ink, 1.8)}
      ${S("M50 84l6-2 4 6z", acc, "none", 0)}
    </symbol>
    <symbol id="mr-ic-data" viewBox="0 0 120 120">
      ${S("M60 96C30 76 20 60 20 46c0-12 10-22 22-22 8 0 14 4 18 10 4-6 10-10 18-10 12 0 22 10 22 22 0 14-10 30-40 50z", "none", acc, 2.4)}
      ${S("M34 56h14l6-12 8 22 6-10h18", "none", ink, 2.4)}
      ${S("M70 24l6-8 4 8", "none", ink, 2)}
    </symbol>
    <symbol id="mr-ic-care" viewBox="0 0 120 120">
      ${S("M22 82c10-18 28-26 46-24l26 6c6 2 6 10 0 10H70", "none", ink, 2.4)}
      ${S("M22 96h22l40-8 20-14", "none", ink, 2.4)}
      ${S("M54 40c-2-10 4-18 12-18s14 8 12 18c-2 6-6 10-12 10s-10-4-12-10z", "none", acc, 2.4)}
      ${S("M56 26l2-8 6 6M76 26l-2-8-6 6", "none", acc, 2.2)}
    </symbol>
    <symbol id="mr-ic-expert" viewBox="0 0 120 120">
      ${S("M22 30h76v50H22z", "none", ink, 2.4)}
      ${S("M50 80l-6 14h32l-6-14", "none", ink, 2.4)}
      ${S("M34 66l12-14 10 8 16-18 14 10", "none", acc, 2.4)}
      ${S("M82 26c6-6 14-2 14 4", "none", acc, 2)}
    </symbol>
    ${["1", "2", "3", "4"].map((n, i) => `<symbol id="mr-dev-${n}" viewBox="0 0 120 100">
      ${i === 0 ? S("M20 86V50a40 40 0 0 1 80 0v36z") + S("M42 64a18 18 0 0 1 36 0v22H42z", soft) : i === 1 ? S("M28 86V40h64v46z") + S("M40 40c0-10 40-10 40 0", "none") + S("M46 70h28", "none", acc, 3) : i === 2 ? S("M40 90V18h40v72z") + S("M40 36h40v20H40z", ink) + S("M50 74h20", "none", acc, 3) : S("M30 60c0-14 60-14 60 0s-60 14-60 0z") + S("M52 60a8 8 0 1 0 16 0 8 8 0 0 0-16 0z", soft)}
      ${S("M96 84c-2-10 4-16 10-16l2-6 4 4 4-4 1 7c4 3 4 10 0 15z", paper, ink, 2)}
    </symbol>`).join("")}
    <symbol id="mr-sns-x" viewBox="0 0 32 32">${S("M6 6l20 20M26 6L6 26", "none", sns, 2.6)}</symbol>
    <symbol id="mr-sns-ig" viewBox="0 0 32 32">${S("M5 9a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z", "none", sns, 2.4)}${S("M11 16a5 5 0 1 0 10 0 5 5 0 0 0-10 0z", "none", sns, 2.4)}</symbol>
    <symbol id="mr-sns-yt" viewBox="0 0 32 32">${S("M3 10c0-3 2-4 5-4h16c3 0 5 1 5 4v12c0 3-2 4-5 4H8c-3 0-5-1-5-4z", sns, sns, 1)}${S("M13 11l8 5-8 5z", paper, "none", 0)}</symbol>
    <symbol id="mr-sns-tt" viewBox="0 0 32 32">${S("M18 4v17a5 5 0 1 1-5-5M18 4c1 4 4 7 8 7", "none", sns, 2.6)}</symbol>
  </svg>`;
  document.body.insertAdjacentHTML("afterbegin", sprite);

  // ── Build Lottie data ──
  const root = document.documentElement;
  const cv = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgb = (name) => {
    cv.clearRect(0, 0, 1, 1);
    cv.fillStyle = getComputedStyle(root).getPropertyValue(name).trim();
    cv.fillRect(0, 0, 1, 1);
    const [r, g, b] = cv.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255, 1];
  };
  const C = () => ({ ink: rgb("--kf-ink"), acc: rgb("--kf-accent"), soft: rgb("--kf-accent-soft"), paper: rgb("--kf-surface"), dim: rgb("--kf-dim") });
  const family = () => (getComputedStyle(root).getPropertyValue("--kf-font-display").trim() || "sans-serif").split(",")[0].replace(/["']/g, "").trim();

  const st = (k) => ({ a: 0, k });
  const IO = { o: { x: [0.33], y: [0] }, i: { x: [0.67], y: [1] } };
  const OUT = { o: { x: [0.2], y: [0.6] }, i: { x: [0.3], y: [1] } };
  const LIN = { o: { x: [0], y: [0] }, i: { x: [1], y: [1] } };
  // [[frame, value, curve?], …] — if the value is a number, wrap it as [value]
  const an = (keys) => ({ a: 1, k: keys.map(([t, s, e = IO], i) => (i < keys.length - 1 ? { t, s: [].concat(s), ...e } : { t, s: [].concat(s) })) });
  const tr = (o = {}) => ({ ty: "tr", p: o.p || st([0, 0]), a: o.a || st([0, 0]), s: o.s || st([100, 100]), r: o.r || st(0), o: o.o || st(100), sk: st(0), sa: st(0) });
  const ell = (w, h, p = [0, 0]) => ({ ty: "el", d: 1, s: st([w, h]), p: st(p) });
  const rect = (w, h, r = 0, p = [0, 0]) => ({ ty: "rc", d: 1, s: st([w, h]), p: st(p), r: st(r) });
  const pathV = (v, c = false, i, o) => ({ i: i || v.map(() => [0, 0]), o: o || v.map(() => [0, 0]), v, c });
  const sh = (v, c, i, o) => ({ ty: "sh", ks: st(pathV(v, c, i, o)) });
  const shA = (keys) => ({ ty: "sh", ks: { a: 1, k: keys.map(([t, p, e = IO], i) => (i < keys.length - 1 ? { t, s: [p], ...e } : { t, s: [p] })) } });
  const fl = (c, o = 100) => ({ ty: "fl", c: st(c), o: st(o), r: 1 });
  const sk = (c, w, o = 100) => ({ ty: "st", c: st(c), o: st(o), w: st(w), lc: 2, lj: 2, ml: 4 });
  const gr = (items, t) => ({ ty: "gr", it: [...items, tr(t)] });
  const layer = (nm, shapes, ks = {}, extra = {}) => ({
    ddd: 0, ty: 4, nm, sr: 1, ao: 0, ip: 0, st: 0, bm: 0,
    ks: { o: ks.o || st(100), r: ks.r || st(0), p: ks.p || st([0, 0, 0]), a: ks.a || st([0, 0, 0]), s: ks.s || st([100, 100, 100]) },
    shapes, ...extra,
  });
  const text = (nm, t, size, color, p, ks = {}) => ({
    ddd: 0, ty: 5, nm, sr: 1, ao: 0, ip: 0, st: 0, bm: 0,
    ks: { o: ks.o || st(100), r: ks.r || st(0), p: ks.p || st([...p, 0]), a: ks.a || st([0, 0, 0]), s: ks.s || st([100, 100, 100]) },
    t: { d: { k: [{ s: { s: size, f: "mr", t, j: 2, tr: 20, lh: size * 1.2, ls: 0, fc: color.slice(0, 3) }, t: 0 }] }, p: {}, m: { g: 1, a: st([0, 0]) }, a: [] },
  });
  const comp = (w, h, fr, op, layers, withFont) => ({
    v: "5.12.2", fr, ip: 0, op, w, h, nm: "mr", ddd: 0, assets: [],
    ...(withFont ? { fonts: { list: [{ fName: "mr", fFamily: family(), fStyle: "Bold", fWeight: "700", ascent: 72, fOrigin: "n" }] } } : {}),
    layers: layers.map((l, i) => ({ ...l, ind: i + 1, op: l.op ?? op })),
  });

  // Cat head (center 0,0 · about 200 wide) — ears, face, eyes, nose. eyes: "open" | "happy" | "dot"
  const catHead = (c, eyes = "open") => [
    gr([sh([[-78, -36], [-60, -104], [-22, -64]], true), fl(c.paper), sk(c.ink, 9)]),
    gr([sh([[78, -36], [60, -104], [22, -64]], true), fl(c.paper), sk(c.ink, 9)]),
    gr([sh([[-64, -52], [-58, -86], [-36, -62]], true), fl(c.soft)]),
    gr([ell(200, 160, [0, 0]), fl(c.paper), sk(c.ink, 9)]),
    gr([sh([[-40, -70], [-6, -76], [-14, -30], [-56, -36]], true), fl(c.soft)]),
    eyes === "happy"
      ? gr([sh([[-48, 0], [-34, -14], [-20, 0]]), sh([[20, 0], [34, -14], [48, 0]]), sk(c.ink, 9)])
      : gr([ell(eyes === "dot" ? 14 : 20, eyes === "dot" ? 14 : 26, [-34, -2]), ell(eyes === "dot" ? 14 : 20, eyes === "dot" ? 14 : 26, [34, -2]), fl(c.ink)]),
    gr([sh([[-10, 22], [10, 22], [0, 32]], true), fl(c.acc), sk(c.acc, 4)]),
    gr([sh([[0, 32], [-12, 44]]), sh([[0, 32], [12, 44]]), sk(c.ink, 6)]),
  ];
  const paw = (c) => [gr([rect(64, 150, 32, [0, 0]), fl(c.paper), sk(c.ink, 9)]), gr([sh([[-14, -60], [-14, -44]]), sh([[14, -60], [14, -44]]), sk(c.ink, 6)]), gr([ell(26, 20, [0, -50]), fl(c.soft)])];

  // Back-to-top toy — a line hangs from the fishing rod tip (650,50) extending from the right, with a TOP circle · fish · dotted ring hanging. The line swings about the rod tip as its axis
  const TAG = [650, 272];
  const toy = (c, ks) => [
    layer("fish", [
      gr([sh([[650, 300], [690, 380], [650, 440], [610, 380]], true, [[0, 0], [0, -40], [20, 0], [0, 40]], [[0, 0], [0, 40], [-20, 0], [0, -40]]), fl(c.acc), sk(c.ink, 4)]),
      gr([sh([[650, 436], [690, 470], [610, 470]], true), fl(c.acc), sk(c.ink, 4)]),
      gr([ell(36, 36, [650, 580]), { ty: "st", c: st(c.ink), o: st(100), w: st(4), lc: 1, lj: 1, ml: 4, d: [{ n: "d", nm: "d", v: st(6) }, { n: "g", nm: "g", v: st(6) }] }]),
      gr([sh([[650, 470], [650, 562]]), sk(c.ink, 4)]),
    ], ks),
    layer("tag", [gr([ell(86, 86, [TAG[0], TAG[1]]), fl(c.paper), sk(c.ink, 5)])], ks),
    layer("string", [gr([sh([[650, 50], [650, 230]]), sk(c.ink, 4)])], ks),
    layer("rod", [gr([rect(190, 14, 7, [745, 50]), fl(c.acc), sk(c.ink, 4)])]),
  ];
  const tagText = (c, ks) => text("TOP", "TOP", 34, c.ink, [TAG[0], TAG[1] + 12], ks);
  const swing = (keys) => ({ r: an(keys), p: st([650, 50, 0]), a: st([650, 50, 0]) });
  const catAt = (c, eyes, p, extra = {}) => layer("cat", catHead(c, eyes), { p, s: st([150, 150, 100]), ...extra });

  const topHover = () => {
    const c = C();
    const ks = swing([[0, 0], [3, 5], [6, -4], [9, 4], [12, -2], [15, 0]]);
    return comp(800, 1400, 6, 15, [tagText(c, ks), ...toy(c, ks)], true);
  };
  const topSp = () => {
    const c = C();
    const ks = swing([[0, 0], [2, 3], [4, -3], [6, 0]]);
    return comp(800, 1400, 6, 6, [tagText(c, ks), ...toy(c, ks)], true);
  };
  // Grab — the cat climbs up (0~20f), stretches out a front paw (20~34f), grabs the circle and pulls it down (34~46f), rejoices (~110f), then returns to place (~150f)
  const topSuccess = () => {
    const c = C();
    const pull = { p: an([[0, [650, 50, 0]], [34, [650, 50, 0]], [46, [650, 270, 0]], [110, [650, 270, 0]], [140, [650, 50, 0], OUT], [150, [650, 50, 0]]]), a: st([650, 50, 0]), r: an([[0, 0], [20, 3], [34, -6], [46, 0], [150, 0]]) };
    const catP = an([[0, [420, 1260, 0]], [20, [460, 1040, 0], OUT], [110, [460, 1040, 0]], [140, [420, 1260, 0]], [150, [420, 1260, 0]]]);
    return comp(800, 1400, 29.97, 150, [
      tagText(c, pull), ...toy(c, pull),
      layer("paw", paw(c), { p: an([[0, [600, 1500, 0]], [20, [600, 1300, 0]], [34, [640, 420, 0], OUT], [46, [640, 640, 0]], [110, [640, 640, 0]], [140, [600, 1500, 0]], [150, [600, 1500, 0]]]), r: an([[0, -20], [34, 8], [46, 0], [150, -20]]) }),
      layer("heart", [gr([sh([[0, 20], [-34, -10], [-20, -36], [0, -20], [20, -36], [34, -10]], true), fl(c.acc)])], { p: an([[46, [300, 900, 0]], [110, [260, 760, 0]]]), o: an([[0, 0], [46, 0], [56, 100], [100, 100], [110, 0], [150, 0]]), s: st([120, 120, 100]) }),
      layer("cat", catHead(c, "happy"), { p: catP, s: st([150, 150, 100]), o: an([[0, 0], [33, 0, LIN], [34, 100], [150, 100]]) }),
      layer("cat0", catHead(c, "open"), { p: catP, s: st([150, 150, 100]), o: an([[0, 100], [33, 100, LIN], [34, 0], [150, 0]]) }),
    ], true);
  };
  // Missing: just before the front paw lands (30f) the circle bounces up for a missed swipe, the cat tilts its head and a sweat drop appears
  const topMiss = () => {
    const c = C();
    const jerk = { p: an([[0, [650, 50, 0]], [28, [650, 50, 0]], [34, [650, -150, 0], OUT], [100, [650, -150, 0]], [140, [650, 50, 0], OUT], [150, [650, 50, 0]]]), a: st([650, 50, 0]), r: an([[0, 0], [34, 8], [44, -6], [56, 3], [70, 0], [150, 0]]) };
    const catP = an([[0, [420, 1260, 0]], [20, [460, 1040, 0], OUT], [110, [460, 1040, 0]], [140, [420, 1260, 0]], [150, [420, 1260, 0]]]);
    return comp(800, 1400, 29.97, 150, [
      tagText(c, jerk), ...toy(c, jerk),
      layer("paw", paw(c), { p: an([[0, [600, 1500, 0]], [20, [600, 1300, 0]], [36, [640, 520, 0], OUT], [50, [620, 1300, 0]], [150, [600, 1500, 0]]]), r: an([[0, -20], [36, 10], [50, -10], [150, -20]]) }),
      layer("drop", [gr([sh([[0, -30], [16, 6], [0, 18], [-16, 6]], true), fl(c.soft), sk(c.ink, 5)])], { p: an([[50, [600, 900, 0]], [100, [600, 960, 0]]]), o: an([[0, 0], [50, 0], [56, 100], [96, 100], [104, 0], [150, 0]]) }),
      layer("cat", catHead(c, "dot"), { p: catP, s: st([150, 150, 100]), r: an([[0, 0], [50, 0], [62, 14], [100, 14], [120, 0], [150, 0]]) }),
    ], true);
  };

  // Shopping tail — the tail rises from the top edge of the band (0~10f), wags three times (10~46f), then retracts (46~58f). The pivot is the tail root
  const tail = () => {
    const c = C();
    const base = [330, 250];
    return comp(450, 250, 12, 58, [
      layer("tail", [gr([sh([[0, 0], [0, -80], [40, -150]], false, [[0, 0], [-10, 30], [-30, 10]], [[0, -30], [10, -40], [0, 0]]), sk(c.ink, 26)]), gr([sh([[0, 0], [0, -80], [40, -150]], false, [[0, 0], [-10, 30], [-30, 10]], [[0, -30], [10, -40], [0, 0]]), sk(c.soft, 16)])],
        { p: st([...base, 0]), a: st([0, 0, 0]), s: an([[0, [100, 0, 100]], [10, [100, 100, 100], OUT], [46, [100, 100, 100]], [58, [100, 0, 100]]]), r: an([[10, 0], [16, 16], [22, -14], [28, 16], [34, -14], [40, 12], [46, 0]]) }),
    ]);
  };

  // Cat ball play (lower right of the first page strip, 140px) — the cat bats the ball with its front paw, the ball rolls away and comes back. Repeats
  const catBall = () => {
    const c = C();
    return comp(300, 260, 30, 60, [
      layer("paw", [gr([rect(28, 70, 14, [0, 0]), fl(c.paper), sk(c.ink, 5)])], { p: an([[0, [118, 210, 0]], [12, [140, 200, 0], OUT], [20, [118, 210, 0]], [60, [118, 210, 0]]]), r: an([[0, 0], [12, -40], [20, 0], [60, 0]]), a: st([0, 30, 0]) }),
      layer("ball", [gr([ell(46, 46), fl(c.acc)]), gr([sh([[-22, 0], [22, 0]]), sk(c.paper, 4)])], { p: an([[0, [176, 222, 0]], [12, [176, 222, 0]], [36, [262, 222, 0], OUT], [60, [176, 222, 0]]]), r: an([[12, 0], [36, 240], [60, 0]]) }),
      layer("cat", catHead(c, "open"), { p: st([90, 120, 0]), s: st([70, 70, 100]), r: an([[0, 0], [12, -6], [36, 8], [60, 0]]) }),
      layer("body", [gr([ell(150, 110, [70, 196]), fl(c.paper), sk(c.ink, 5)]), gr([ell(60, 40, [86, 186]), fl(c.soft)])]),
    ]);
  };

  // FEATURE dots — three circles bounce up at 8f intervals (overshoot), and at 28f the center logo spot sets
  const featurePoint = () => {
    const c = C();
    const pop = (t) => an([[t, [0, 0, 100], OUT], [t + 10, [110, 110, 100]], [t + 14, [100, 100, 100]]]);
    const spots = [[160, 160], [458, 160], [309, 400]];
    return comp(618, 574, 30, 41, [
      text("logo", "logo", 40, c.acc, [309, 300], { s: pop(28) }),
      ...spots.flatMap(([x, y], i) => [
        text(`n${i}`, `0${i + 1}`, 44, c.paper, [x, y + 14], { s: pop(i * 8) }),
        layer(`c${i}`, [gr([ell(220, 220, [0, 0]), fl(i === 1 ? c.dim : c.acc)])], { p: st([x, y, 0]), s: pop(i * 8) }),
      ]),
    ], true);
  };

  // Header icons: cart — from 11f the bag hops and a face appears / my page — from 2f the head tilts and a sparkle dot appears
  const cart = () => {
    const c = C();
    return comp(128, 140, 12, 24, [
      layer("face", [gr([ell(8, 8, [-12, 0]), ell(8, 8, [12, 0]), fl(c.ink)]), gr([sh([[-8, 12], [0, 18], [8, 12]]), sk(c.ink, 5)])], { p: an([[11, [64, 92, 0]], [15, [64, 80, 0], OUT], [19, [64, 92, 0]]]), o: an([[0, 0], [11, 0, LIN], [12, 100], [24, 100]]) }),
      layer("bag", [gr([sh([[20, 50], [108, 50], [116, 128], [12, 128]], true), sk(c.ink, 7)]), gr([sh([[44, 50], [44, 34], [84, 34], [84, 50]], false, [[0, 0], [0, 12], [-12, 0], [0, -12]], [[0, -12], [12, 0], [0, 12], [0, 0]]), sk(c.ink, 7)])],
        { p: an([[11, [64, 128, 0]], [15, [64, 116, 0], OUT], [19, [64, 128, 0]], [24, [64, 128, 0]]]), a: st([64, 128, 0]), s: an([[11, [100, 100, 100]], [13, [108, 92, 100]], [15, [96, 106, 100]], [19, [104, 96, 100]], [22, [100, 100, 100]]]) }),
    ]);
  };
  const mypage = () => {
    const c = C();
    return comp(128, 140, 12, 24, [
      layer("point", [gr([sh([[100, 26], [112, 14]]), sh([[106, 40], [122, 38]]), sh([[92, 16], [96, 2]]), sk(c.acc, 6)])], { o: an([[0, 0], [2, 0, LIN], [4, 100], [14, 100], [18, 0], [24, 0]]) }),
      layer("head", [gr([ell(52, 52, [0, 0]), sk(c.ink, 7)]), gr([sh([[-26, -4], [0, -26], [26, -4]], false, [[0, 0], [-16, 0], [0, -14]], [[0, -14], [16, 0], [0, 0]]), fl(c.ink)])],
        { p: st([64, 52, 0]), a: st([0, 20, 0]), r: an([[2, 0], [6, -12], [10, 6], [14, 0]]) }),
      layer("body", [gr([sh([[20, 128], [64, 84], [108, 128]], false, [[0, 0], [-30, 0], [0, -30]], [[0, -30], [30, 0], [0, 0]]), sk(c.ink, 7)])]),
    ]);
  };

  window.MR_ART = { topHover, topSp, topSuccess, topMiss, tail, catBall, featurePoint };
  window.fxLottie = Object.assign(window.fxLottie || {}, {
    get mrCart() { return cart(); },
    get mrMypage() { return mypage(); },
  });
})();
