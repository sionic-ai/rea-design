// 원본 Lottie 와 같은 판 크기·프레임 수·키프레임 타이밍으로 우리 그림(사람 머리 실루엣·방울 얼굴)을 새로 그린 Lottie 를 굽는다.
// 원본 JSON 은 쓰지 않는다. 색은 층의 cl(클래스)로 나눠 css 가 --kf-* 에서 칠한다 — JSON 의 색은 아무 회색이다.
//   node library/no-meets-ltd/lottie/make.cjs
const fs = require("fs"), path = require("path");
const gray = [0.5, 0.5, 0.5, 1];
const st = (v) => ({ a: 0, k: v });
const E_OUT = [0.167, 0.167, 0.833, 0.833];
// keys: [frame, value, [ox, oy, ix, iy]] — 마지막 키는 값만
const anim = (keys) => ({
  a: 1,
  k: keys.map(([t, v, e], i) => {
    const s = [].concat(v);
    if (i === keys.length - 1) return { t, s };
    const [ox, oy, ix, iy] = e || E_OUT;
    return { t, s, o: { x: [ox], y: [oy] }, i: { x: [ix], y: [iy] } };
  }),
});
const tr = () => ({ ty: "tr", p: st([0, 0]), a: st([0, 0]), s: st([100, 100]), r: st(0), o: st(100), sk: st(0), sa: st(0) });
// 점 목록을 지나는 부드러운 곡선(Catmull-Rom → 베지어 손잡이)
const curve = (pts, closed = false) => {
  const n = pts.length, I = [], O = [];
  pts.forEach((p, k) => {
    const a = pts[closed ? (k - 1 + n) % n : Math.max(0, k - 1)], b = pts[closed ? (k + 1) % n : Math.min(n - 1, k + 1)];
    const tx = (b[0] - a[0]) / 6, ty = (b[1] - a[1]) / 6;
    const end = !closed && (k === 0 || k === n - 1);
    I.push(end && k === 0 ? [0, 0] : [-tx, -ty]); O.push(end && k === n - 1 ? [0, 0] : [tx, ty]);
  });
  return { ty: "sh", ks: { a: 0, k: { i: I, o: O, v: pts, c: closed } } };
};
const ell = (x, y, w, h) => ({ ty: "el", p: st([x, y]), s: st([w, h]) });
const rect = (x, y, w, h, r = 0) => ({ ty: "rc", p: st([x, y]), s: st([w, h]), r: st(r) });
const star = (x, y, pts, outer, inner) => ({ ty: "sr", sy: 1, d: 1, pt: st(pts), p: st([x, y]), r: st(0), ir: st(inner), is: st(0), or: st(outer), os: st(0) });
const fill = () => ({ ty: "fl", c: st(gray), o: st(100), r: 1 });
const stroke = (w) => ({ ty: "st", c: st(gray), o: st(100), w: st(w), lc: 2, lj: 2, ml: 4 });
const group = (items) => ({ ty: "gr", it: [...items, tr()] });
// 사람 머리 실루엣(어깨 → 목 → 머리 둘레 → 목 → 어깨). 바닥 가운데가 원점, 높이 ≈ 120
const headPts = () => {
  const pts = [[-46, 0], [-30, -8], [-19, -30], [-16, -52]];
  for (let d = 125; d <= 415; d += 29) { const a = (d * Math.PI) / 180; pts.push([Math.cos(a) * 32, -84 + Math.sin(a) * 32]); }
  pts.push([16, -52], [19, -30], [30, -8], [46, 0]);
  return pts;
};
const headOutline = (w = 9) => group([curve(headPts()), stroke(w)]);
const headFill = () => group([curve([...headPts(), [0, 6]], true), fill()]);
const eyes = (dx = 9, y = -86, r = 8) => group([ell(-dx, y, r, r), ell(dx, y, r, r), fill()]);
const layer = (ind, nm, cl, shapes, ks = {}, ip = 0, op = 9999) => ({
  ddd: 0, ind, ty: 4, nm, cl, sr: 1, ao: 0, ip, op, st: 0, bm: 0, shapes,
  ks: { o: ks.o || st(100), r: ks.r || st(0), p: ks.p || st([0, 0, 0]), a: ks.a || st([0, 0, 0]), s: ks.s || st([100, 100, 100]) },
});
const doc = (nm, fr, op, w, h, layers) => ({ v: "5.12.2", fr, ip: 0, op, w, h, nm, ddd: 0, assets: [], layers });
const all = {};
const out = (name, j) => { fs.writeFileSync(path.join(__dirname, name + ".json"), JSON.stringify(j)); all[name] = j; };

// 로더(1325×392, 60fps, 1800f): 얼굴 여덟이 150px 간격(x 138 + 150i, y 212)으로 서고, 36f 마다 하나씩
// 앞 얼굴이 납작(6f)·늘며 뛰어(11f) 사라지고 새 얼굴이 32px 위에서 떨어져(9f) 납작·제자리, 344~366f 에 다 같이 뛰어 사라진다
{
  const cls = ["pink", "lav", "lime", "red2", "purple", "blue", "cyan", "magenta"];
  const layers = [];
  cls.forEach((c, i) => {
    const x = 138 + 150 * i, y = 212, t = 36 * i;
    layers.push(layer(20 + i, "front" + i, "nm-f-" + c, [headFill(), group([ell(-9, -86, 7, 7), ell(9, -86, 7, 7), fill()])], {
      p: anim([[t + 15, [x, y, 0]], [t + 25, [x, y - 42, 0]]]),
      s: anim([[t, [100, 100, 100]], [t + 6, [100, 60, 100]], [t + 17, [90, 120, 100]]]),
      o: anim([[t + 17, 100], [t + 22, 0]]),
    }, 0, 1800 + t));
    const t2 = 25 + 36 * i;
    layers.unshift(layer(10 + i, "side" + i, "nm-f-" + c, [headFill(), group([ell(14, -86, 7, 7), fill()])], {
      p: anim([[t2, [x, y - 32, 0]], [t2 + 9, [x, y, 0]], [359, [x, y, 0]], [365, [x, y - 21, 0]]]),
      s: anim([[t2 + 8, [90, 115, 100]], [t2 + 14, [100, 60, 100]], [t2 + 21, [100, 100, 100]], [344, [100, 100, 100]], [350, [100, 60, 100]], [361, [90, 120, 100]]]),
      o: anim([[t2, 0], [t2 + 7, 100], [361, 100], [366, 0]]),
    }, t2, 1800 + t2));
  });
  out("loader", doc("loader", 60, 1800, 1325, 392, layers));
}

// 첫 화면 로고(3584×2164, 60fps, 51f): 글자 두 덩이가 0→15f 에 0→100% 로 커지고, 머리 넷이 20f 부터 110px 위에서 떨어지며(7f) 나타나
// 25~39f 에 늘었다(90/115) 납작(100/55) 제자리로 선다. 글자 자리는 원본 워드마크 대신 굵은 막대 덩이(로고 자리)
{
  const pop = { s: anim([[0, [0, 0, 100], [0.7, 0.7, 0.833, 0.833]], [15, [100, 100, 100]]]) };
  const wordL = [rect(-640, 0, 300, 260, 26), rect(-300, 0, 240, 70, 35), rect(-10, 0, 260, 270, 16), rect(290, 0, 240, 70, 35), rect(600, 0, 300, 270, 20), fill()];
  const wordR = [rect(-620, 0, 380, 280, 40), rect(-180, 0, 300, 280, 140), rect(180, 0, 300, 280, 22), rect(520, 0, 260, 280, 22), rect(830, 0, 260, 280, 22), fill()];
  const drop = (x, y, i) => ({
    p: anim([[20, [x, y - 110, 0]], [27, [x, y, 0]]]),
    s: anim([[25, [90, 115, 100]], [31, [100, 55, 100], [0.66, 0.66, 0.833, 0.833]], [39, [100, 100, 100]]]),
    o: anim([[20, 0], [27, 100]]),
    a: st([0, 0, 0]),
  });
  const heads = [[1177, 1395, "red"], [1438, 1395, "blue"], [2151, 1395, "red"], [2415, 1395, "blue"]];
  const layers = [
    layer(1, "wordL", "nm-f-blue", [group(wordL)], { p: st([900, 1640, 0]), ...pop }),
    layer(2, "wordR", "nm-f-red", [group(wordR)], { p: st([2560, 1640, 0]), ...pop }),
  ];
  heads.forEach(([x, y, c], i) => {
    const sc = st([260, 260, 100]);
    layers.push(layer(10 + i, "head" + i, "nm-s-" + c, [group([curve(headPts()), stroke(9)])], drop(x, y, i), 20, 1820));
    layers.push(layer(20 + i, "eyes" + i, "nm-f-" + (c === "red" ? "blue" : "red"), [eyes(10, -84, 9)], drop(x, y, i), 20, 1820));
  });
  // 머리는 판에 비해 작으니 2.6 배로 키운 그룹 안에 그린다
  layers.forEach((l) => { if (/^(head|eyes)/.test(l.nm)) l.shapes = [{ ty: "gr", it: [...l.shapes, { ...tr(), s: st([280, 280]) }] }]; });
  out("logo", doc("logo", 60, 51, 3584, 2164, layers));
}

// 폰 첫 화면 로고(500×600, 60fps, 99f): 머리 둘이 20f 에 떨어지고, 글자 막대 여섯이 0·7·30·36·42·51f 에 차례로 커진다
{
  const layers = [];
  const bars = [[150, 330, 170, 60, "blue"], [330, 330, 150, 60, "blue"], [130, 430, 180, 60, "red"], [300, 430, 140, 60, "red"], [170, 520, 160, 50, "red"], [340, 520, 140, 50, "blue"]];
  [0, 7, 30, 36, 42, 51].forEach((ip, i) => {
    const [x, y, w, h, c] = bars[i];
    layers.push(layer(1 + i, "bar" + i, "nm-f-" + c, [group([rect(0, 0, w, h, h / 2), fill()])], {
      p: st([x, y, 0]), s: anim([[ip, [0, 0, 100], [0.7, 0.7, 0.833, 0.833]], [ip + 15, [100, 100, 100]]]),
    }, ip, 1800 + ip));
  });
  [[170, 250, "red"], [330, 250, "blue"]].forEach(([x, y, c], i) => {
    const ks = {
      p: anim([[20, [x, y - 60, 0]], [27, [x, y, 0]]]),
      s: anim([[25, [90, 115, 100]], [31, [100, 55, 100], [0.66, 0.66, 0.833, 0.833]], [39, [100, 100, 100]]]),
      o: anim([[20, 0], [27, 100]]),
    };
    layers.push(layer(10 + i, "head" + i, "nm-s-" + c, [{ ty: "gr", it: [curve(headPts()), stroke(8), { ...tr(), s: st([120, 120]) }] }], ks, 20, 1820));
    layers.push(layer(20 + i, "eyes" + i, "nm-f-" + (c === "red" ? "blue" : "red"), [{ ty: "gr", it: [eyes(9, -84, 8), { ...tr(), s: st([120, 120]) }] }], ks, 20, 1820));
  });
  out("logo_sp", doc("logo_sp", 60, 99, 500, 600, layers));
}

// 메뉴·넘김·선언문 아이콘(200×200, 60fps, 121f 고리) — 방울 얼굴. 원본도 같은 판·같은 길이로 2초마다 돈다
// 원본 넘김 아이콘은 재생 뒤 약 70f(1.17s) 움직이고 나머지는 멈춰 있다(probe: 판이 들어온 뒤 1367ms 까지 바뀌고 433ms 멈춤) — 우리 그림도 앞 70f 에 몬다
const wob = (deg) => anim([[0, 0, [0.42, 0, 0.58, 1]], [18, deg, [0.42, 0, 0.58, 1]], [35, 0, [0.42, 0, 0.58, 1]], [52, -deg, [0.42, 0, 0.58, 1]], [70, 0], [120, 0]]);
const squash = () => anim([[0, [100, 100, 100], [0.42, 0, 0.58, 1]], [15, [116, 84, 100], [0.42, 0, 0.58, 1]], [30, [90, 112, 100], [0.42, 0, 0.58, 1]], [45, [106, 95, 100], [0.42, 0, 0.58, 1]], [60, [100, 100, 100]], [120, [100, 100, 100]]]);
const blink = () => anim([[0, [100, 100, 100]], [20, [100, 100, 100]], [25, [100, 10, 100]], [30, [100, 100, 100]], [50, [100, 100, 100]], [55, [100, 10, 100]], [60, [100, 100, 100]], [120, [100, 100, 100]]]);
// 원본 아이콘은 그림 여러 장을 갈아 끼우는 꼴이라 층의 transform 이 움직이지 않는다(motion-probe 에 안쪽 움직임이 안 잡힘).
// 우리 그림도 키프레임을 15f 마다 한 장씩 「자세」로 굳혀, 자세 층을 ip/op 로 갈아 끼운다
const valueAt = (prop, t) => {
  if (!prop || !prop.a) return prop;
  const k = prop.k;
  if (t <= k[0].t) return { a: 0, k: k[0].s };
  for (let i = 0; i < k.length - 1; i++) {
    if (t <= k[i + 1].t) { const f = (t - k[i].t) / (k[i + 1].t - k[i].t); return { a: 0, k: k[i].s.map((v, j) => v + (k[i + 1].s[j] - v) * f) }; }
  }
  return { a: 0, k: k[k.length - 1].s };
};
const POSE = 15;
// 자세마다 층·묶음 변형을 도형 꼭짓점에 구워 넣는다 — 층이 처음 그려질 때 transform 이 새로 박히면 재기 도구가 움직임으로 본다
const K = 0.5523;
const mat = (p = [0, 0], a = [0, 0], s = [100, 100], r = 0) => {
  const c = Math.cos((r * Math.PI) / 180), n = Math.sin((r * Math.PI) / 180), sx = s[0] / 100, sy = s[1] / 100;
  // M = T(p)·R·S·T(-a)
  const A = c * sx, B = n * sx, C = -n * sy, D = c * sy;
  return [A, B, C, D, p[0] - (A * a[0] + C * a[1]), p[1] - (B * a[0] + D * a[1])];
};
const mul = (m, q) => [m[0] * q[0] + m[2] * q[1], m[1] * q[0] + m[3] * q[1], m[0] * q[2] + m[2] * q[3], m[1] * q[2] + m[3] * q[3], m[0] * q[4] + m[2] * q[5] + m[4], m[1] * q[4] + m[3] * q[5] + m[5]];
const pt = (m, [x, y]) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
const vec = (m, [x, y]) => [m[0] * x + m[2] * y, m[1] * x + m[3] * y];
const toPath = (sh) => {
  const v = (x) => (x && x.k !== undefined ? x.k : x);
  if (sh.ty === "sh") return v(sh.ks);
  if (sh.ty === "el") { const [cx, cy] = v(sh.p), [w, h] = v(sh.s), rx = w / 2, ry = h / 2;
    return { c: true, v: [[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]], o: [[rx * K, 0], [0, ry * K], [-rx * K, 0], [0, -ry * K]], i: [[-rx * K, 0], [0, -ry * K], [rx * K, 0], [0, ry * K]] }; }
  if (sh.ty === "rc") { const [cx, cy] = v(sh.p), [w, h] = v(sh.s), rr = Math.min(v(sh.r) || 0, w / 2, h / 2), x0 = cx - w / 2, y0 = cy - h / 2, x1 = cx + w / 2, y1 = cy + h / 2, k = rr * K;
    const V = [[x0 + rr, y0], [x1 - rr, y0], [x1, y0 + rr], [x1, y1 - rr], [x1 - rr, y1], [x0 + rr, y1], [x0, y1 - rr], [x0, y0 + rr]];
    const O = [[0, 0], [k, 0], [0, 0], [0, k], [0, 0], [-k, 0], [0, 0], [0, -k]], I = [[0, 0], [0, 0], [0, -k], [0, 0], [k, 0], [0, 0], [0, k], [0, 0]];
    return { c: true, v: V, o: O, i: I }; }
  if (sh.ty === "sr") { const [cx, cy] = v(sh.p), n = v(sh.pt), ro = v(sh.or), ri = v(sh.ir), V = [];
    for (let k = 0; k < n * 2; k++) { const ang = (k * Math.PI) / n - Math.PI / 2, rad = k % 2 ? ri : ro; V.push([cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad]); }
    return { c: true, v: V, o: V.map(() => [0, 0]), i: V.map(() => [0, 0]) }; }
  return null;
};
const bake = (items, m, out, styles) => {
  const trItem = items.find((x) => x.ty === "tr");
  const v = (x, d) => (x ? (x.k !== undefined ? x.k : x) : d);
  const gm = trItem ? mul(m, mat(v(trItem.p, [0, 0]), v(trItem.a, [0, 0]), v(trItem.s, [100, 100]), v(trItem.r, 0))) : m;
  const scale = Math.sqrt(Math.abs(gm[0] * gm[3] - gm[1] * gm[2]));
  const mine = [], st = [];
  items.forEach((x) => {
    if (x.ty === "gr") bake(x.it, gm, out, styles);
    else if (x.ty === "fl" || x.ty === "st") st.push(x.ty === "st" ? { ...x, w: { a: 0, k: v(x.w) * scale } } : x);
    else if (x.ty !== "tr") { const pth = toPath(x); if (pth) mine.push({ ty: "sh", ks: { a: 0, k: { c: pth.c, v: pth.v.map((q) => pt(gm, q)), i: pth.i.map((q) => vec(gm, q)), o: pth.o.map((q) => vec(gm, q)) } } }); }
  });
  if (mine.length) out.push({ ty: "gr", it: [...mine, ...(st.length ? st : styles), tr()] });
};
const poseify = (layers) => {
  const outL = [];
  let ind = 1;
  for (let t = 0; t < 120; t += POSE) {
    layers.forEach((l) => {
      const at = (k, d) => { const x = valueAt(l.ks[k], t); return x ? x.k : d; };
      const m = mat(at("p", [0, 0, 0]).slice(0, 2), at("a", [0, 0, 0]).slice(0, 2), at("s", [100, 100, 100]).slice(0, 2), at("r", 0));
      const shapes = [];
      bake(l.shapes, m, shapes, []);
      outL.push({ ...l, ind: ind++, ip: t, op: t + POSE >= 120 ? 121 : t + POSE, shapes, ks: { o: st(100), r: st(0), p: st([0, 0, 0]), a: st([0, 0, 0]), s: st([100, 100, 100]) } });
    });
  }
  return outL;
};
const icon = (name, layers) => out("icon_" + name, doc(name, 60, 121, 200, 200, poseify(layers)));
const C = st([100, 100, 0]);
icon("about", [
  layer(3, "fg", "nm-f-blue", [group([curve(headPts().map(([x, y]) => [x + 74, y + 160]).concat([[74, 166]]), true), fill()]), group([curve(headPts().map(([x, y]) => [x + 126, y + 160]).concat([[126, 166]]), true), fill()])], { p: C, a: C, s: st([80, 80, 100]), r: wob(4) }),
  layer(2, "bg", "nm-f-pink", [group([rect(100, 104, 176, 120, 50), fill()])], { s: squash(), a: st([100, 160, 0]), p: st([100, 160, 0]) }),
]);
icon("works", [
  layer(3, "mouth", "nm-s-green", [group([curve([[52, 118], [80, 136], [120, 136], [148, 118]]), stroke(7)])], { p: C, a: C, s: squash() }),
  layer(2, "eyes", "nm-f-ink-invert", [group([ell(76, 92, 14, 14), ell(124, 92, 14, 14), fill()])], { p: st([100, 92, 0]), a: st([100, 92, 0]), s: blink() }),
  layer(1, "body", "nm-f-blue", [group([curve([[30, 150], [26, 90], [44, 52], [64, 72], [100, 66], [136, 72], [156, 52], [174, 90], [170, 150], [100, 166]], true), fill()])], { p: C, a: C, s: squash() }),
]);
icon("member", [
  layer(3, "faces", "nm-f-pink", [group([rect(64, 128, 30, 26, 6), rect(100, 128, 30, 26, 6), rect(136, 128, 30, 26, 6), fill()])], { p: st([100, 128, 0]), a: st([100, 128, 0]), s: blink() }),
  layer(2, "dome", "nm-f-red", [group([curve([[34, 160], [36, 92], [70, 52], [100, 46], [130, 52], [164, 92], [166, 160]], true), fill()])], { p: C, a: C, s: squash() }),
]);
icon("wanted", [
  layer(4, "cheeks", "nm-f-pink", [group([ell(64, 108, 18, 12), ell(132, 112, 18, 12), fill()])], { p: C, a: C, r: wob(5) }),
  layer(3, "faceA", "nm-f-yellow", [group([ell(70, 100, 76, 70), fill()])], { p: anim([[0, [0, 0, 0], [0.42, 0, 0.58, 1]], [17, [0, -14, 0], [0.42, 0, 0.58, 1]], [35, [0, 0, 0]], [120, [0, 0, 0]]]) }),
  layer(2, "faceB", "nm-f-yellow", [group([ell(132, 104, 76, 70), fill()])], { p: anim([[0, [0, 0, 0]], [35, [0, 0, 0], [0.42, 0, 0.58, 1]], [52, [0, -14, 0], [0.42, 0, 0.58, 1]], [70, [0, 0, 0]], [120, [0, 0, 0]]]) }),
]);
icon("topic", [
  layer(2, "core", "nm-f-yellow", [group([ell(100, 100, 56, 56), fill()])], { p: C, a: C, s: squash() }),
  layer(1, "burst", "nm-f-green", [group([star(100, 100, 14, 84, 58), fill()])], { p: C, a: C, r: anim([[0, 0, [0.42, 0, 0.58, 1]], [70, 90], [120, 90]]) }),
]);
icon("contact", [
  layer(2, "lines", "nm-s-pink", [group([curve([[58, 92], [142, 92]]), curve([[58, 110], [142, 110]]), curve([[58, 128], [120, 128]]), stroke(6)])], { p: C, a: C, r: wob(6) }),
  layer(1, "card", "nm-s-pink", [group([rect(100, 110, 140, 90, 30), stroke(7)])], { p: C, a: C, r: wob(6) }),
]);
icon("faces", [
  layer(2, "a", "nm-s-red", [group([curve(headPts()), stroke(7), { ...tr(), p: st([62, 170]), s: st([80, 80]) }])], { p: C, a: C, s: squash() }),
  layer(1, "b", "nm-s-blue", [group([curve(headPts()), stroke(7), { ...tr(), p: st([138, 170]), s: st([80, 80]) }])], { p: C, a: C, r: wob(4) }),
]);
icon("eyes", [
  layer(2, "pupils", "nm-f-blue", [group([ell(70, 100, 22, 22), ell(130, 100, 22, 22), fill()])], { p: anim([[0, [0, 0, 0], [0.42, 0, 0.58, 1]], [18, [12, 0, 0], [0.42, 0, 0.58, 1]], [35, [0, 0, 0], [0.42, 0, 0.58, 1]], [52, [-12, 0, 0], [0.42, 0, 0.58, 1]], [70, [0, 0, 0]], [120, [0, 0, 0]]]) }),
  layer(1, "whites", "nm-s-blue", [group([ell(70, 100, 54, 54), ell(130, 100, 54, 54), stroke(6)])], { p: st([100, 100, 0]), a: st([100, 100, 0]), s: blink() }),
]);

fs.writeFileSync(path.join(__dirname, "data.js"), "// make.cjs 가 굽는다 — file:// 에서도 lottie 가 그림을 받도록 전역으로 싣는다(lottie-hover-play 부품은 window.fxLottie 를 본다)\nwindow.NM_LOTTIE = " + JSON.stringify(all) + ";\nwindow.fxLottie = Object.assign(window.fxLottie || {}, window.NM_LOTTIE);\n");
console.log(Object.keys(all).join(" "));
