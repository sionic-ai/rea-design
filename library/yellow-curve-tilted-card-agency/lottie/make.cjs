#!/usr/bin/env node
// 머리 로고 Lottie — 원본 navlogo(1158×338 · 24fps · 150프레임 = 변주 다섯 × 30프레임)와 같은 판·같은 타이밍으로 우리 도형 워드마크를 굽는다.
// 원본 JSON 은 옮기지 않는다. 원본은 변주마다 50프레임짜리 안쪽 장면을 시간 늘이기로 30프레임에 넣었다 — 여기서는 그 키 시각에 .6 을 곱해 바로 적는다.
// 손이 올 때마다 다음 변주 하나(30프레임)를 틀고 그 끝 프레임에 멈추니, 변주마다 쉬는 모양(첫·끝 프레임)이 같아야 한다.
// 칠은 회색으로 두고 shared.css 가 path 칠을 currentColor 로 덮는다(원본 .c-NavLogo__animation svg path).
//   node library/fiasco-design/lottie/make.cjs   →  lottie/data.js (window.fxLottie.fiLogo)
const fs = require("fs");
const path = require("path");

const FR = 24, STEP = 30, W = 1158, H = 338, OP = STEP * 5;
const st = (v) => ({ a: 0, k: v });
// 원본 키 곡선 — 대부분 나감 .8/0 · 들어옴 .2/1, 넷째 변주만 .9/0 · .1/1
const curve = (o, i) => (n) => ({ o: { x: Array(n).fill(o), y: Array(n).fill(0) }, i: { x: Array(n).fill(i), y: Array(n).fill(1) } });
const E = curve(0.8, 0.2), E4 = curve(0.9, 0.1);
// 키 목록 [시각, 값, 곡선] → 움직이는 속성. 값이 같은 키 사이는 그대로 머문다
const anim = (keys) => ({
  a: 1,
  k: keys.map(([t, s, e], n) => {
    const v = Array.isArray(s) ? s : [s];
    return n === keys.length - 1 ? { t, s: v } : e === "hold" ? { t, s: v, h: 1 } : { t, s: v, ...(e || E)(v.length) };
  }),
});
const fill = (evenodd) => ({ ty: "fl", c: st([0.5, 0.5, 0.5, 1]), o: st(100), r: evenodd ? 2 : 1 });
const tr = (o = {}) => ({ ty: "tr", p: st([0, 0]), a: st([0, 0]), s: st([100, 100]), r: st(0), o: st(100), sk: st(0), sa: st(0), ...o });
const rect = (x0, y0, x1, y1, r = 0) => ({ ty: "rc", d: 1, p: st([(x0 + x1) / 2, (y0 + y1) / 2]), s: st([x1 - x0, y1 - y0]), r: st(r) });
const ell = (cx, cy, rx, ry = rx) => ({ ty: "el", d: 1, p: st([cx, cy]), s: st([rx * 2, ry * 2]) });
const poly = (pts) => ({ ty: "sh", ks: st({ c: true, v: pts, i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]) }) });
const group = (items, t, evenodd) => ({ ty: "gr", it: [...items, fill(evenodd), tr(t)] });
let ind = 0;
const layer = (nm, c, ks, shapes, ip = 0, op = OP) => ({
  ddd: 0, ind: ++ind, ty: 4, nm, sr: 1, ao: 0, bm: 0, ip, op, st: 0, shapes,
  ks: { o: st(100), r: st(0), s: st([100, 100, 100]), ...ks, a: st([c[0], c[1], 0]), p: ks.p || st([c[0], c[1], 0]) },
});
// 키 모음 도우미 — 변주 시작 프레임 b 에서 원본 안쪽 키 시각 t(50프레임 기준)를 바깥 프레임으로
const at = (b, t) => +(b + Math.min(t * 0.6, STEP - 1)).toFixed(2);
const B = [0, 30, 60, 90, 120];

// 쉬는 모양 — 글자로 읽히지 않는 도형 여섯(창 난 판·알약+마름모·원판·구멍 난 네모·반원·고리)을 원본 낱자 자리·폭에 둔다. 바닥선 300, 낮은 도형 110~300
const C = { f: [110, 165], i: [254, 205], a: [425, 205], s: [640, 205], c: [850, 245], o: [1060, 205] };
const ring = (cx, cy) => [ell(cx, cy, 95), ell(cx, cy, 45)];
const fArm = (y0, y1, x1) => rect(20, y0, x1, y1, 6);
const arc = (cx, cy, r, a0, a1, n = 16) => Array.from({ length: n + 1 }, (_, k) => {
  const t = ((a0 + ((a1 - a0) * k) / n) * Math.PI) / 180;
  return [+(cx + Math.cos(t) * r).toFixed(1), +(cy - Math.sin(t) * r).toFixed(1)];
});

// 1 · 창 난 판: 쉴 때는 판 안에 숨은 띠 둘이 둘째 변주에 가운데 띠, 첫·넷째 변주에 윗띠로 오른쪽에 늘었다 돌아온다(원본 첫 낱자 모양 바꿈 자리)
const fTop = anim([
  [0, [100, 100]], [at(B[0], 23.5), [140, 100]], [at(B[0], 42.9), [100, 100]],
  [B[3], [100, 100], E4], [at(B[3], 12), [125, 100], E4], [at(B[3], 36), [125, 100], E4], [at(B[3], 50), [100, 100]],
]);
const fMid = anim([
  [B[1], [100, 100]], [at(B[1], 1.3), [100, 100]], [at(B[1], 15.4), [150, 100]], [at(B[1], 34.6), [150, 100]], [at(B[1], 48.7), [100, 100]],
]);
const glyphF = layer("f", C.f, {}, [
  group([fArm(30, 92, 190)], { a: st([20, 61]), p: st([20, 61]), s: fTop }),
  group([fArm(212, 262, 190)], { a: st([20, 237]), p: st([20, 237]), s: fMid }),
  group([rect(20, 30, 190, 300, 24), rect(62, 120, 148, 186, 8)], {}, true),
]);

// 2 · 알약+마름모
const [ix, iy] = C.i;
const iPos = anim([
  // 1: 오른쪽 셋째·넷째 낱자 사이까지 날아가며 74% 로 줄고 −10° 기운다(23.5 → 46.9)
  [0, [ix, iy]], [at(B[0], 23.47), [ix + 488, iy + 48]], [at(B[0], 46.94), [ix, iy]],
  // 2: 왼쪽으로 100 밀렸다 돌아옴(17.3 · 32.7)
  [B[1], [ix, iy]], [at(B[1], 17.3), [ix - 100, iy]], [at(B[1], 32.7), [ix - 100, iy]], [at(B[1], 50), [ix, iy]],
  // 3: 왼쪽으로 49(3.2 → 25.5 → 47.8)
  [B[2], [ix, iy]], [at(B[2], 3.2), [ix, iy]], [at(B[2], 25.5), [ix - 49, iy]], [at(B[2], 47.8), [ix, iy]],
  // 4: 왼쪽으로 55(0 → 12 … 36 → 50)
  [B[3], [ix, iy], E4], [at(B[3], 12), [ix - 55, iy], E4], [at(B[3], 36), [ix - 55, iy], E4], [at(B[3], 50), [ix, iy]],
]);
const iScale = anim([
  [0, [100, 100]], [at(B[0], 20.4), [74, 74]], [at(B[0], 26.5), [74, 74]], [at(B[0], 46.9), [100, 100]],
  // 5: 줄기가 눌렸다 선다(원본 i 모양 바꿈 0 · 12 · 37 · 49)
  [B[4], [100, 100]], [at(B[4], 12), [108, 86]], [at(B[4], 37), [108, 86]], [at(B[4], 49), [100, 100]],
]);
const iRot = anim([[0, 0], [at(B[0], 20.4), -10], [at(B[0], 26.5), -10], [at(B[0], 46.9), 0]]);
// 점은 첫 변주에 132% 로 부푼다
const dotScale = anim([[0, [100, 100]], [at(B[0], 20.4), [132, 132]], [at(B[0], 26.5), [132, 132]], [at(B[0], 46.9), [100, 100]]]);
// 셋째 변주: 14.3 에 키 큰 알약으로 바뀌고 36.6 에 돌아온다 · 넷째 변주: 6 ~ 42 동안 숨고 조각 셋이 떨어진다
const iBase = anim([
  [0, 100, "hold"], [at(B[2], 14.3), 0, "hold"], [at(B[2], 36.6), 100, "hold"],
  [at(B[3], 6), 0, "hold"], [at(B[3], 42), 100, "hold"], [OP - 1, 100],
]);
const iAlt = anim([[0, 0, "hold"], [at(B[2], 14.3), 100, "hold"], [at(B[2], 36.6), 0, "hold"], [OP - 1, 0]]);
const diamond = poly([[254, 16], [290, 52], [254, 88], [218, 52]]);
const glyphI = layer("i", C.i, { p: iPos, s: iScale, r: iRot, o: iBase }, [
  group([rect(222, 110, 286, 300, 32)]),
  group([diamond], { a: st([254, 52]), p: st([254, 52]), s: dotScale }),
]);
const glyphIAlt = layer("i-alt", C.i, { p: iPos, o: iAlt }, [group([rect(222, 30, 286, 300, 32)])]);
// 넷째 변주의 조각 셋(마름모·윗알약·아랫알약) — 6 ~ 42 동안 보이고, 12 → 36 에 320 아래로 떨어진다(판 밖으로)
const pieces = [[diamond], [rect(222, 110, 286, 200, 32)], [rect(222, 208, 286, 300, 32)]].map((shape, n) =>
  layer(`i-piece-${n + 1}`, C.i, {
    p: anim([
      [B[3], [ix, iy], E4], [at(B[3], 12), [ix - 55, iy], E4], [at(B[3], 36), [ix - 55, iy + 320]],
    ]),
  }, [group(shape)], at(B[3], 6), at(B[3], 42)));

// 3 · 원판
const [ax, ay] = C.a;
const aPos = anim([
  [B[1], [ax, ay]], [at(B[1], 17.3), [ax - 121, ay]], [at(B[1], 32.7), [ax - 121, ay]], [at(B[1], 50), [ax, ay]],
  [B[2], [ax, ay]], [at(B[2], 3.2), [ax, ay]], [at(B[2], 25.5), [ax - 82, ay]], [at(B[2], 47.8), [ax, ay]],
]);
const aScale = anim([
  [B[3], [100, 100], E4], [at(B[3], 12), [122, 100], E4], [at(B[3], 36), [122, 100], E4], [at(B[3], 50), [100, 100]],
  [B[4], [100, 100]], [at(B[4], 12), [140, 100]], [at(B[4], 37), [140, 100]], [at(B[4], 49), [100, 100]],
]);
// 셋째 변주 14.3 ~ 36.6 은 고리로, 다섯째 변주 6 ~ 44 는 구멍 난 세모로 바뀐다(원본 다른 꼴 낱자 자리)
const aBase = anim([
  [0, 100, "hold"], [at(B[2], 14.3), 0, "hold"], [at(B[2], 36.6), 100, "hold"],
  [at(B[4], 6), 0, "hold"], [at(B[4], 44), 100, "hold"], [OP - 1, 100],
]);
const aRing = anim([[0, 0, "hold"], [at(B[2], 14.3), 100, "hold"], [at(B[2], 36.6), 0, "hold"], [OP - 1, 0]]);
const aTri = anim([[0, 0, "hold"], [at(B[4], 6), 100, "hold"], [at(B[4], 44), 0, "hold"], [OP - 1, 0]]);
const glyphA = layer("a", C.a, { p: aPos, s: aScale }, [
  group([ell(425, 205, 95)], { o: aBase }),
  group(ring(425, 205), { o: aRing }, true),
  group([poly([[425, 110], [530, 300], [320, 300]]), poly([[425, 190], [455, 260], [395, 260]])], { o: aTri }, true),
]);

// 4 · 구멍 난 네모
const [sx, sy] = C.s;
const sPos = anim([[B[2], [sx, sy]], [at(B[2], 3.2), [sx, sy]], [at(B[2], 25.5), [sx - 81, sy]], [at(B[2], 47.8), [sx, sy]]]);
// 둘째 변주: 앞 낱자가 밀려난 틈을 가로로 늘어 메운다(원본 s 모양 바꿈 2.3 ~ 47.7) · 다섯째: 조금 좁아졌다 돌아옴
const sScale = anim([
  [B[1], [100, 100]], [at(B[1], 2.3), [100, 100]], [at(B[1], 17.3), [215, 100]], [at(B[1], 32.7), [215, 100]], [at(B[1], 47.7), [100, 100]],
  [B[4], [100, 100]], [at(B[4], 12), [88, 100]], [at(B[4], 37), [88, 100]], [at(B[4], 49), [100, 100]],
]);
const glyphS = layer("s", C.s, { p: sPos, s: sScale }, [
  group([rect(568, 110, 712, 300, 22), ell(640, 205, 34)], {}, true),
]);

// 5 · 반원(평평한 쪽이 아래)
const [cx, cy] = C.c;
const cPos = anim([
  [B[1], [cx, cy]], [at(B[1], 2.3), [cx, cy]], [at(B[1], 17.3), [cx + 83, cy]], [at(B[1], 32.7), [cx + 83, cy]], [at(B[1], 47.7), [cx, cy]],
  [B[2], [cx, cy]], [at(B[2], 3.2), [cx, cy]], [at(B[2], 25.5), [cx - 4, cy]], [at(B[2], 47.8), [cx, cy]],
]);
const cScale = anim([[B[2], [100, 100]], [at(B[2], 3.2), [100, 100]], [at(B[2], 25.5), [138, 100]], [at(B[2], 47.8), [100, 100]]]);
// 넷째 변주: 평평한 쪽이 오른쪽으로 돌아갔다 돌아온다(원본 다섯째 낱자 다른 꼴 6 ~ 42)
const cRot = anim([[B[3], 0, E4], [at(B[3], 12), -90, E4], [at(B[3], 36), -90, E4], [at(B[3], 46), 0]]);
// 다섯째 변주: 9 ~ 44 동안 고리가 숨고 점 서른 개가 하나씩 켜져 고리를 다시 짓는다
const cBase = anim([[0, 100, "hold"], [at(B[4], 9), 0, "hold"], [at(B[4], 44), 100, "hold"], [OP - 1, 100]]);
const glyphC = layer("c", C.c, { p: cPos, s: cScale, r: cRot, o: cBase }, [
  group([poly(arc(cx, 300, 112, 0, 180))]),
]);
// 점은 반원 자리 둘레에 놓는다. 켜지는 시각은 원본 C 층들처럼 0 ~ 8.5 사이로 흩는다 — 굽는 값이 늘 같게 정해진 순서로
const order = [6, 1, 9, 4, 0, 3, 7, 2, 8, 5];
const bits = Array.from({ length: 30 }, (_, n) => {
  const ang = ((n * 12) * Math.PI) / 180, r = n % 2 ? 82 : 58;
  const x = cx + Math.cos(ang) * r, y = cy - Math.sin(ang) * r;
  const t0 = at(B[4], 0.5 + (order[n % 10] * 8) / 9 + (n % 3) * 0.1);
  return layer(`c-bit-${n + 1}`, [x, y], {}, [group([ell(x, y, n % 2 ? 15 : 12)])], t0, at(B[4], 47));
});
// 번쩍 조각 열다섯 — 3.5 프레임(안쪽)씩만 켜진다(원본 C2)
const flash = Array.from({ length: 15 }, (_, n) => {
  const ang = ((20 + n * 22) * Math.PI) / 180, x = cx + Math.cos(ang) * 70, y = cy - Math.sin(ang) * 70;
  const t0 = at(B[4], 6 + (order[n % 10] * 3.5) / 9);
  return layer(`c-flash-${n + 1}`, [x, y], {}, [group([rect(x - 14, y - 14, x + 14, y + 14, 3)])], t0, +(t0 + 3.5 * 0.6).toFixed(2));
});

// 6 · 고리(o) — 둘째 변주에 납작해졌다 선다(원본 o 모양 바꿈 2.9 ~ 47.1)
const oScale = anim([[B[1], [100, 100]], [at(B[1], 2.9), [100, 100]], [at(B[1], 17.9), [116, 84]], [at(B[1], 32.1), [116, 84]], [at(B[1], 47.1), [100, 100]]]);
const glyphO = layer("o", C.o, { s: oScale }, [group(ring(C.o[0], C.o[1]), {}, true)]);

const logo = {
  v: "5.12.2", fr: FR, ip: 0, op: OP, w: W, h: H, nm: "fi-logo-variations", ddd: 0, assets: [],
  layers: [...flash, ...bits, ...pieces, glyphIAlt, glyphI, glyphF, glyphA, glyphS, glyphC, glyphO],
};

const dir = __dirname;
fs.writeFileSync(path.join(dir, "data.js"),
  "// lottie/make.cjs 가 굽는다 — 손으로 고치지 않는다\nwindow.fxLottie = Object.assign(window.fxLottie || {}, " + JSON.stringify({ fiLogo: logo }) + ");\n");
console.log("lottie/data.js", fs.statSync(path.join(dir, "data.js")).size, "bytes ·", logo.layers.length, "layers");
