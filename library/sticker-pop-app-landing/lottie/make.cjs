#!/usr/bin/env node
// 원본 Lottie 두 개와 같은 판 크기·프레임으로 우리 그림을 굽는다(원본 JSON 은 옮기지 않는다).
//   famLogo — 푸터 로고 회전: 1080×1080 · 60fps · 66프레임(1.1s). 네모 고리가 세로축으로 한 바퀴 돌아 보이게 가로 배율 1 → −1 → 1
//   famSend — 「쉬움」 카드 보내기 아이콘: 250×250 · 60fps · 120프레임(2s, 원본은 2배속으로 1s). 종이비행기가 오른쪽 위로 날아갔다 왼쪽 아래에서 돌아온다
// 색은 회색으로 두고 쓰는 쪽 css 가 path 칠을 옷 변수로 덮는다.
//   node library/family-co/lottie/make.cjs   →  lottie/data.js (window.fxLottie)
const fs = require("fs");
const path = require("path");

const st = (v) => ({ a: 0, k: v });
const ease = { o: { x: [0.6, 0.6, 0.6], y: [0, 0, 0] }, i: { x: [0.4, 0.4, 0.4], y: [1, 1, 1] } };
const kf = (t, s, e = ease) => ({ t, s, ...e });
const tr = () => ({ ty: "tr", p: st([0, 0]), a: st([0, 0]), s: st([100, 100]), r: st(0), o: st(100), sk: st(0), sa: st(0) });
const fill = () => ({ ty: "fl", c: st([0.5, 0.5, 0.5, 1]), o: st(100), r: 1 });
const rect = (x, y, w, h, r) => ({ ty: "rc", d: 1, p: st([x, y]), s: st([w, h]), r: st(r) });
const poly = (pts) => ({ ty: "sh", ks: st({ c: true, v: pts, i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]) }) });
const group = (items) => ({ ty: "gr", it: [...items, fill(), tr()] });
const layer = (nm, op, ks, shapes) => ({ ddd: 0, ind: 1, ty: 4, nm, sr: 1, ks, ao: 0, shapes, ip: 0, op, st: 0, bm: 0 });
const ks = (o) => ({ o: st(100), r: st(0), p: st([0, 0, 0]), a: st([0, 0, 0]), s: st([100, 100, 100]), ...o });
const anim = (nm, w, h, op, layers) => ({ v: "5.10.2", fr: 60, ip: 0, op, w, h, nm, ddd: 0, assets: [], layers });

// 로고: 모서리 네 칸 + 잇는 막대 넷(가운데 빈 네모)
const corner = 80, bar = 40, half = 120;
const logo = anim("fa-logo-spin", 1080, 1080, 66, [
  layer("mark", 66, ks({
    p: st([540, 540, 0]),
    s: { a: 1, k: [kf(0, [100, 100, 100]), kf(33, [-100, 100, 100]), kf(66, [100, 100, 100])] },
  }), [
    group([
      rect(-half, -half, corner, corner, 24), rect(half, -half, corner, corner, 24),
      rect(-half, half, corner, corner, 24), rect(half, half, corner, corner, 24),
      rect(0, -half, 2 * half, bar, 0), rect(0, half, 2 * half, bar, 0),
      rect(-half, 0, bar, 2 * half, 0), rect(half, 0, bar, 2 * half, 0),
    ]),
  ]),
]);

// 종이비행기: 0→50f 오른쪽 위로 날아가 사라짐, 51f 왼쪽 아래로 옮김, 60→110f 가운데로 돌아옴
const out = { o: { x: [0.55, 0.55, 0.55], y: [0, 0, 0] }, i: { x: [0.9, 0.9, 0.9], y: [0.6, 0.6, 0.6] } };
const inn = { o: { x: [0.1, 0.1, 0.1], y: [0.4, 0.4, 0.4] }, i: { x: [0.3, 0.3, 0.3], y: [1, 1, 1] } };
const hold = { h: 1 };
const plane = anim("fa-send", 250, 250, 120, [
  layer("plane", 120, ks({
    p: { a: 1, k: [kf(0, [125, 125, 0], out), kf(50, [260, -10, 0], hold), kf(51, [-10, 260, 0], inn), kf(110, [125, 125, 0])] },
    o: { a: 1, k: [kf(0, [100], { o: { x: [0.5], y: [0] }, i: { x: [0.5], y: [1] } }), kf(45, [0], hold), kf(51, [0], { o: { x: [0.3], y: [0] }, i: { x: [0.5], y: [1] } }), kf(80, [100])] },
  }), [
    group([poly([[-70, 10], [75, -65], [30, 70], [5, 30]])]),
  ]),
]);

const dir = __dirname;
fs.writeFileSync(path.join(dir, "data.js"),
  "// lottie/make.cjs 가 굽는다 — 손으로 고치지 않는다\nwindow.fxLottie = Object.assign(window.fxLottie || {}, " +
  JSON.stringify({ famLogo: logo, famSend: plane }) + ");\n");
console.log("lottie/data.js", fs.statSync(path.join(dir, "data.js")).size, "bytes");
