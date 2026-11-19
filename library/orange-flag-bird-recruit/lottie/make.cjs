// 원본 Lottie 와 같은 판 크기·프레임 수·길이로 우리 그림(선·새·반짝임)을 새로 그린 Lottie JSON 을 굽는다.
// 원본 JSON 은 쓰지 않는다 — 선 색은 css 가 --kf-* 로 덮으므로 여기 색은 아무 회색이면 된다.
//   node library/meglia-recruit-com/lottie/make.cjs
const fs = require("fs"), path = require("path");
const gray = [0.5, 0.5, 0.5, 1];
const st = (v) => ({ a: 0, k: v });
const anim = (keys) => ({ a: 1, k: keys.map(([t, v, ease], i) => (i < keys.length - 1 ? { t, s: [].concat(v), i: { x: [ease?.[2] ?? 0.3], y: [ease?.[3] ?? 1] }, o: { x: [ease?.[0] ?? 0.7], y: [ease?.[1] ?? 0] } } : { t, s: [].concat(v) })) });
const tr = (o = {}) => ({ ty: "tr", p: st(o.p || [0, 0]), a: st(o.a || [0, 0]), s: st(o.s || [100, 100]), r: o.r || st(0), o: o.o || st(100), sk: st(0), sa: st(0) });
// 점 목록을 지나는 부드러운 곡선(Catmull-Rom → 베지어 손잡이)
const curve = (pts, closed = false) => {
  const n = pts.length, I = [], O = [];
  pts.forEach((p, k) => {
    const a = pts[Math.max(0, k - 1)], b = pts[Math.min(n - 1, k + 1)];
    const tx = (b[0] - a[0]) / 6, ty = (b[1] - a[1]) / 6;
    I.push(k === 0 ? [0, 0] : [-tx, -ty]); O.push(k === n - 1 ? [0, 0] : [tx, ty]);
  });
  return { a: 0, k: { i: I, o: O, v: pts, c: closed } };
};
const strokeLayer = (ind, name, pts, op, { w = 3, draw = [0, 40], erase = null, opacity = null, closed = false } = {}) => ({
  ddd: 0, ind, ty: 4, nm: name, sr: 1, ao: 0, ip: 0, op, st: 0, bm: 0,
  ks: { o: opacity || st(100), r: st(0), p: st([0, 0, 0]), a: st([0, 0, 0]), s: st([100, 100, 100]) },
  shapes: [
    { ty: "gr", nm: name, it: [{ ty: "sh", ks: curve(pts, closed) }, { ty: "st", c: st(gray), o: st(100), w: st(w), lc: 2, lj: 2, ml: 4 }, tr()] },
    { ty: "tm", nm: "trim", s: erase ? anim([[erase[0], 0, [0.6, 0, 0.4, 1]], [erase[1], 100]]) : st(0), e: anim([[draw[0], 0, [0.5, 0, 0.2, 1]], [draw[1], 100]]), o: st(0), m: 1 },
  ],
});
const doc = (nm, fr, op, w, h, layers) => ({ v: "5.12.2", fr, ip: 0, op, w, h, nm, ddd: 0, assets: [], layers });
// file:// 에서는 lottie 가 JSON 을 못 받아 오니(XHR 막힘) 같은 그림을 data.js 로도 실어 animationData 로 넘긴다
const all = {};
const out = (name, j) => { fs.writeFileSync(path.join(__dirname, name), JSON.stringify(j)); all[name.replace(".json", "")] = j; };
const rnd = (seed) => () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);

// 첫 화면 선(1400×800, 29.97fps, 180f = 6s): 사진 위로 가는 곡선이 .5s 간격으로 그어지고(1.3s), 5s 부터 앞쪽부터 지워진다
const FR = 29.9700012207031;
for (let v = 1; v <= 4; v++) {
  const r = rnd(v * 97), layers = [];
  // 사람 둘레를 감도는 굵은 손그림 선 몇 줄 + 햇살 짧은 선 — 화면 가운데 왼쪽에 모인다
  const count = [7, 7, 6, 8][v - 1], cx = 560 + v * 30, cy = 380;
  for (let k = 0; k < count; k++) {
    const pts = [], turns = 1 + r() * 0.8, rad = 140 + r() * 220, a0 = r() * Math.PI * 2;
    for (let q = 0; q <= 6; q++) { const t = q / 6, ang = a0 + t * Math.PI * turns; pts.push([cx + Math.cos(ang) * rad * (0.8 + 0.4 * t), cy + Math.sin(ang) * rad * 0.9 + (t - 0.5) * 120]); }
    const t0 = Math.round(k * 6 + r() * 6);
    layers.push(strokeLayer(k + 1, "line" + k, pts, 180, { w: 3.5 + r() * 2, draw: [t0, t0 + 45], erase: [150 + Math.round(r() * 10), 179] }));
  }
  for (let k = 0; k < 6; k++) {
    const ang = -Math.PI * (0.25 + k * 0.1), x = cx + Math.cos(ang) * 260, y = cy - 120 + Math.sin(ang) * 200;
    const t0 = 30 + k * 3;
    layers.push(strokeLayer(count + k + 1, "ray" + k, [[x, y], [x + Math.cos(ang) * 60, y + Math.sin(ang) * 60]], 180, { w: 4, draw: [t0, t0 + 15], erase: [152, 172] }));
  }
  out(`mv-line-0${v}.json`, doc("mv-line-0" + v, FR, v === 2 ? 179 : 180, 1400, 800, layers));
}

// 오프닝(1400×800, 150f = 5s): 가운데서 바깥으로 곡선 열 줄이 1.5s 동안 차례로 그어지고, 원이 하나 그려진 뒤 4.3s 부터 판 전체가 투명해진다
{
  const r = rnd(7), layers = [], fade = anim([[128, 100, [0.4, 0, 0.6, 1]], [150, 0]]);
  for (let k = 0; k < 9; k++) {
    const ang = (k / 9) * Math.PI * 2, pts = [[700, 400]];
    for (let s = 1; s <= 4; s++) pts.push([700 + Math.cos(ang + s * 0.35) * s * 170, 400 + Math.sin(ang + s * 0.35) * s * 95]);
    layers.push(strokeLayer(k + 1, "ray" + k, pts, 150, { w: 2 + r() * 2, draw: [10 + k * 4, 55 + k * 4], opacity: fade }));
  }
  const circ = []; for (let a = 0; a <= 12; a++) circ.push([700 + Math.cos((a / 12) * Math.PI * 2 - Math.PI / 2) * 90, 400 + Math.sin((a / 12) * Math.PI * 2 - Math.PI / 2) * 90]);
  layers.push(strokeLayer(10, "ring", circ, 150, { w: 5, draw: [60, 100], opacity: fade }));
  out("opening.json", doc("opening", FR, 150, 1400, 800, layers));
}

// 사원 카드 장식(422×528, 90f = 3s): 인물 뒤 둥근 반짝임 네 개가 .2s 차례로 그어진다
{
  const spots = [[60, 90], [360, 70], [380, 300], [40, 330]], layers = [];
  spots.forEach(([x, y], k) => {
    const pts = []; for (let a = 0; a <= 10; a++) pts.push([x + Math.cos((a / 10) * Math.PI * 2) * 26, y + Math.sin((a / 10) * Math.PI * 2) * 26]);
    layers.push(strokeLayer(k + 1, "spark" + k, pts, 90, { w: 3, draw: [k * 6, 24 + k * 6] }));
  });
  out("voice-top.json", doc("voice-top", FR, 90, 422, 528, layers));
}

// 새(98×67, 60fps, 54f = .9s): 몸 하나 + 날개 둘이 위아래로 두 번 퍼덕이며 오른쪽 위로 조금 떠오른다
{
  const flap = (sign) => anim([[0, 0, [0.4, 0, 0.6, 1]], [9, sign * -38, [0.4, 0, 0.6, 1]], [18, sign * 22, [0.4, 0, 0.6, 1]], [27, sign * -34, [0.4, 0, 0.6, 1]], [40, sign * 14, [0.4, 0, 0.6, 1]], [54, 0]]);
  const fill = (name, pts, ind, rot, anchor) => ({
    ddd: 0, ind, ty: 4, nm: name, sr: 1, ao: 0, ip: 0, op: 54, st: 0, bm: 0, parent: ind === 1 ? undefined : 1,
    ks: { o: st(100), r: rot || st(0), p: st(anchor ? [anchor[0], anchor[1], 0] : [0, 0, 0]), a: st(anchor ? [anchor[0], anchor[1], 0] : [0, 0, 0]), s: st([100, 100, 100]) },
    shapes: [{ ty: "gr", nm: name, it: [{ ty: "sh", ks: curve(pts, true) }, { ty: "fl", c: st(gray), o: st(100), r: 1 }, tr()] }],
  });
  const body = fill("body", [[18, 44], [40, 36], [66, 34], [84, 26], [80, 40], [58, 50], [30, 52]], 1, null, null);
  body.ks.p = anim([[0, [0, 4, 0], [0.4, 0, 0.6, 1]], [27, [4, -2, 0], [0.4, 0, 0.6, 1]], [54, [0, 4, 0]]]);
  const wingA = fill("wing-near", [[44, 38], [36, 14], [52, 4], [62, 34]], 2, flap(1), [50, 38]);
  const wingB = fill("wing-far", [[50, 36], [60, 12], [72, 8], [66, 34]], 3, flap(-0.7), [58, 36]);
  out("bird-move.json", doc("bird-move", 60, 54, 98, 67, [wingA, body, wingB].map((l, k) => ({ ...l, ind: [2, 1, 3][k] }))));
}
fs.writeFileSync(path.join(__dirname, "data.js"), "// make.cjs 가 굽는 파일 — 고치지 말고 make.cjs 를 고쳐 다시 굽는다\n(() => { window.mgLottie = " + JSON.stringify(all) + "; })();\n");
console.log("ok");
