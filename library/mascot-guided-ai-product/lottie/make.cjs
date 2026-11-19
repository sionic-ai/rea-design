// 소개 장 「약속」 고리 넷 — 원본 Lottie 메타(1200×800, 30fps, 90프레임 = 3초 반복, 반투명 10% 모양 층 다섯)만 따르고 그림은 새로 굽는다.
// 겹친 방울이 숨 쉬듯 모양을 바꾼다. 색은 회색으로 두고 about.css 가 옷 색으로 덮는다. file:// 에서도 돌게 data.js(전역)로 낸다.
const fs = require("fs");
const W = 1200, H = 800, OP = 90, N = 10;
const lcg = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647;
const blob = (cx, cy, r, wob, rnd, phase) => {
  const pts = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const k = r * (1 + wob * Math.sin(a * 3 + phase) * 0.5 + (rnd() - 0.5) * wob);
    pts.push([cx + Math.cos(a) * k, cy + Math.sin(a) * k * 0.82]);
  }
  const t = 0.36 * (2 * Math.PI * r / N) / 2;
  const tan = pts.map((_, i) => { const a = (i / N) * Math.PI * 2; return [-Math.sin(a) * t, Math.cos(a) * t * 0.82]; });
  return { i: tan.map(([x, y]) => [-x, -y]), o: tan, v: pts, c: true };
};
const make = (seed) => {
  const rnd = lcg(seed);
  const layers = Array.from({ length: 5 }, (_, n) => {
    const cx = W / 2 + (rnd() - 0.5) * 360, cy = H / 2 + (rnd() - 0.5) * 220, r = 170 + rnd() * 130;
    const ks = [0, 30, 60].map((f, j) => ({ t: f, s: [blob(cx + (j - 1) * 24, cy + (j === 1 ? -18 : 12), r, 0.22, lcg(seed * 7 + n * 31 + j), j * 2.1 + n)], i: { x: 0.45, y: 1 }, o: { x: 0.55, y: 0 } }));
    ks.push({ t: OP, s: ks[0].s });
    return {
      ddd: 0, ind: n + 1, ty: 4, nm: `blob_${n}`, sr: 1, ip: 0, op: OP, st: 0, bm: 0,
      ks: { o: { a: 0, k: 10 }, r: { a: 1, k: [{ t: 0, s: [0], i: { x: [0.45], y: [1] }, o: { x: [0.55], y: [0] } }, { t: 45, s: [n % 2 ? 6 : -6], i: { x: [0.45], y: [1] }, o: { x: [0.55], y: [0] } }, { t: OP, s: [0] }] }, p: { a: 0, k: [W / 2, H / 2, 0] }, a: { a: 0, k: [W / 2, H / 2, 0] }, s: { a: 0, k: [100, 100, 100] } },
      shapes: [{ ty: "gr", nm: "g", it: [{ ty: "sh", nm: "p", ks: { a: 1, k: ks } }, { ty: "fl", nm: "f", c: { a: 0, k: [0.5, 0.5, 0.5, 1] }, o: { a: 0, k: 100 }, r: 1 }, { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }] }],
    };
  });
  return { v: "5.12.0", fr: 30, ip: 0, op: OP, w: W, h: H, nm: "loop", ddd: 0, assets: [], layers };
};
const out = { A: make(11), B: make(23), C: make(37), D: make(53) };
fs.writeFileSync(__dirname + "/data.js", "// make.cjs 가 구운 것 — 손으로 고치지 않는다\nwindow.tLoops = " + JSON.stringify(out) + ";\n");
console.log("data.js", fs.statSync(__dirname + "/data.js").size);
