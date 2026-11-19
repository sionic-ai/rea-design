// Line-art illustration for the media intro — in the original, three oval islands (farm, industrial city, forest and sea) overlap on a single S-curved line winding from the seed below to the flower above,
// A line drawing of people walking, running, swinging and playing music on the road outside the island, with sun, clouds, satellite and airplane in the sky.
// Props are redrawn at the same positions and sizes on a 4:5 panel (960×1200 coordinates) matching the original image (1200×1500).
(() => {
  const svg = document.getElementById("ab-illust");
  if (!svg) return;
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent = svg) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    parent.append(n);
    return n;
  };
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const P = (d, cls = "ln") => el("path", { class: cls, d });
  const C = (cx, cy, r, cls = "fl") => el("circle", { class: cls, cx, cy, r });
  const E = (cx, cy, rx, ry, cls = "fl", rot = 0) => el("ellipse", { class: cls, cx, cy, rx, ry, transform: `rotate(${rot} ${cx} ${cy})` });
  const R = (x, y, w, h, cls = "fl") => el("rect", { class: cls, x, y, width: w, height: h });
  const T = (x, y, txt, size) => { const n = el("text", { class: "tx", x, y, "font-size": size }); n.textContent = txt; };

  // ── Person ── bottom center of the feet is (x, y). pose: stand·walk·run·arms·sit·reach
  const person = (x, y, s = 1, pose = "stand", flip = 1) => {
    const f = (v) => v * s * flip, u = (v) => v * s;
    const legs = {
      stand: `M${x - u(3)} ${y - u(13)} l${-u(1)} ${u(13)} M${x + u(3)} ${y - u(13)} l${u(1)} ${u(13)}`,
      walk: `M${x} ${y - u(13)} l${f(-6)} ${u(13)} M${x} ${y - u(13)} l${f(5)} ${u(13)}`,
      run: `M${x} ${y - u(13)} l${f(-9)} ${u(8)} l${f(-2)} ${u(6)} M${x} ${y - u(13)} l${f(8)} ${u(5)} l${f(4)} ${u(8)}`,
      sit: `M${x - u(3)} ${y - u(13)} h${f(10)} v${u(13)} M${x + u(3)} ${y - u(13)} h${f(10)} v${u(13)}`,
    };
    const arms = {
      stand: `M${x - u(4)} ${y - u(24)} l${-u(3)} ${u(10)} M${x + u(4)} ${y - u(24)} l${u(3)} ${u(10)}`,
      arms: `M${x - u(4)} ${y - u(24)} l${-u(7)} ${-u(8)} M${x + u(4)} ${y - u(24)} l${u(7)} ${-u(8)}`,
      reach: `M${x - u(4)} ${y - u(24)} l${-u(3)} ${u(10)} M${x + u(4)} ${y - u(24)} l${f(11)} ${-u(2)}`,
      run: `M${x} ${y - u(24)} l${f(-8)} ${u(5)} M${x} ${y - u(24)} l${f(7)} ${-u(4)} l${f(3)} ${u(4)}`,
    };
    P(legs[pose] || legs.stand);
    P(`M${x - u(4.5)} ${y - u(26)} h${u(9)} l${u(1)} ${u(13)} h${-u(11)}z`, "fl");
    P(arms[pose] || (pose === "walk" ? arms.run : arms.stand));
    C(x, y - u(31), u(4.6));
    P(`M${x - u(4.6)} ${y - u(31)} a${u(4.6)} ${u(4.6)} 0 0 1 ${u(9.2)} 0z`, "dk");
  };
  const crowd = (list) => list.forEach(([x, y, s, pose, flip]) => person(x, y, s, pose, flip));

  // ── Plants · Nature ──
  const tree = (x, y, s = 1, kind = "round") => {
    P(`M${x} ${y} v${-12 * s}`);
    if (kind === "poplar") E(x, y - 30 * s, 9 * s, 20 * s);
    else if (kind === "big") P(`M${x - 34 * s} ${y - 26 * s} c-10 -20 12 -34 26 -28 c6 -16 34 -14 38 0 c18 -4 26 16 14 28 c-8 10 -66 12 -78 0z`, "fl");
    else C(x, y - 21 * s, 10 * s);
    if (kind === "big") P(`M${x} ${y} v${-24 * s} l-12 -10 M${x} ${y - 20 * s} l14 -12 M${x} ${y - 24 * s} l2 -12`);
  };
  const grass = (x, y, s = 1) => P(`M${x} ${y} l${2 * s} ${-6 * s} l${2 * s} ${6 * s} l${2 * s} ${-5 * s} l${2 * s} ${5 * s}`);
  const flowerTop = (x, y, r) => {
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
      E(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.5, r * 0.36, "fl", (a * 180) / Math.PI);
    }
    C(x, y, r * 0.3); C(x, y, r * 0.14, "dk");
  };
  const tulip = (x, y, r) => P(`M${x - r} ${y - r * 0.2} q${r * 0.2} ${r * 1.3} ${r} ${r * 1.2} q${r * 0.8} 0 ${r} ${-r * 1.2} q${-r * 0.4} ${r * 0.3} ${-r * 0.5} ${r * 0.2} q${-r * 0.1} ${-r * 0.9} ${-r * 0.5} ${-r * 1.1} q${-r * 0.4} ${r * 0.2} ${-r * 0.5} ${r * 1.1} q${-r * 0.2} 0 ${-r * 0.5} ${-r * 0.2}z`, "fl");
  const fluff = (x, y, s, rot) => {
    const g = el("g", { transform: `rotate(${rot} ${x} ${y})` });
    el("path", { class: "ln", d: `M${x} ${y} v${10 * s}` }, g);
    for (let k = -3; k <= 3; k++) el("path", { class: "ln", d: `M${x} ${y} l${k * 2.4 * s} ${-6 * s}` }, g);
  };
  const cloud = (x, y, s) => P(`M${x} ${y} c${-14 * s} 0 ${-16 * s} ${-16 * s} ${-2 * s} ${-18 * s} c${2 * s} ${-14 * s} ${22 * s} ${-16 * s} ${26 * s} ${-6 * s} c${8 * s} ${-12 * s} ${30 * s} ${-8 * s} ${28 * s} ${6 * s} c${14 * s} 0 ${16 * s} ${18 * s} ${2 * s} ${18 * s}z`, "fl");
  const bird = (x, y, s = 1) => P(`M${x - 6 * s} ${y - 3 * s} q${3 * s} 0 ${6 * s} ${3 * s} q${2 * s} ${-5 * s} ${7 * s} ${-6 * s}`);
  const wave = (x, y) => P(`M${x} ${y} q3 -4 6 0 q3 4 6 0`);

  // ── Background stems: flower stem → upper island → center island → big left bend → bottom seed ──
  // Lay down the bottom island first so the upper island’s edge comes in front — in the original too, the upper island’s bottom line covers the middle island’s top line
  [[535, 872, 295, 128], [457, 612, 248, 113], [612, 395, 282, 110]].forEach(([cx, cy, rx, ry]) => E(cx, cy, rx, ry, "fl"));
  P("M175 118 C180 200 205 285 245 325 M216 186 C222 250 232 300 245 325 M292 196 C262 240 247 290 245 325");
  P("M245 325 C282 380 312 420 350 436");
  P("M332 400 C250 440 205 520 215 600 C222 650 244 680 268 686");
  P("M254 547 C170 580 112 650 115 735 C118 830 165 930 260 1000 C330 1045 420 1062 470 1080");
  P("M196 975 C262 1012 380 1050 470 1072");
  P("M245 325 c-22 6 -30 -6 -26 -14 c10 -6 22 2 26 14 c4 -16 18 -24 26 -18 c4 10 -12 20 -26 18z", "fl");

  // ── Sky · top left ──
  flowerTop(175, 92, 44); flowerTop(216, 166, 26); tulip(292, 172, 24);
  [[90, 95, 1, -20], [245, 36, 1, 30], [318, 24, 1, 10], [272, 78, 0.9, 40], [146, 214, 0.9, -60]].forEach(([x, y, s, r]) => fluff(x, y, s, r));
  E(362, 84, 58, 42);
  P("M308 92 l-16 6 l20 2", "fl");
  person(400, 104, 0.95, "reach", -1);
  P("M366 92 l-8 -4 v8z M352 104 v-10 m-14 10 v-8 m0 0 q-4 -4 -6 0 m6 0 q4 -4 6 0", "fl");
  const sat = el("g", { transform: "rotate(-35 600 66)" });
  [[574, 60, 18, 12], [594, 58, 12, 16], [610, 60, 18, 12]].forEach(([x, y, w, h]) => el("rect", { class: "fl", x, y, width: w, height: h }, sat));
  C(750, 104, 44);
  [58, 72, 86].forEach((r) => P(`M${750 + r * Math.cos(1.6)} ${104 + r * Math.sin(1.6)} A${r} ${r} 0 0 1 ${750 + r * Math.cos(-1.3)} ${104 + r * Math.sin(-1.3)}`, "ds"));
  P("M790 210 l40 -6 l8 -8 l4 2 l-4 10 l20 -2 l-2 6 l-22 4 l-8 18 l-6 0 l2 -16 l-26 4z", "fl");
  cloud(390, 200, 1.4); cloud(470, 182, 1.2);
  for (let k = 0; k < 6; k++) P(`M${372 + k * 16} ${214} q${-6 - k} ${44} ${-16 - k * 4} ${84 - k * 6}`, "ds");

  // ── Top island: farm ──
  const furrow = (x, y) => { P(`M${x} ${y} l96 -26`); for (let k = 0; k < 6; k++) grass(x + 10 + k * 15, y - 6 - k * 4, 0.7); };
  for (let k = 0; k < 4; k++) furrow(426 + k * 6, 412 + k * 22);
  // House (rooftop solar panels) and trees
  R(452, 286, 54, 36); P("M446 288 l32 -30 l34 30z", "fl");
  P("M462 278 l14 -12 l14 12 M468 272 h20 M462 278 h28", "ln");
  R(472, 300, 10, 22, "dk"); R(456, 296, 10, 9); R(490, 296, 10, 9);
  tree(442, 324, 0.9, "poplar"); tree(518, 326, 0.9, "poplar"); tree(500, 334, 0.7, "round");
  C(486, 236, 18); person(486, 252, 0.55, "stand");
  C(545, 264, 16); P("M537 266 a8 8 0 1 1 16 0 M553 266 l-4 -4 M553 266 l4 -4");
  P("M570 270 h16 l-6 -6 M586 270 l-6 6");
  // Water tank and stand
  P("M588 284 h112 l-10 16 h-92z", "fl");
  R(610, 210, 70, 76); E(645, 210, 35, 8); P("M612 230 h66 M612 252 h66 M612 272 h66");
  P("M604 214 v70 M612 214 v70 M604 222 h8 M604 236 h8 M604 250 h8 M604 264 h8 M604 278 h8");
  C(655, 268, 7); P("M640 240 h14 m-7 -7 v14");
  P("M612 316 l-18 18 m0 0 h10 m-10 0 v-10");
  // Tractor
  R(372, 368, 46, 20); R(396, 346, 22, 22); C(380, 392, 13); C(380, 392, 4, "dk"); C(414, 396, 9); P("M350 384 h22");
  C(462, 378, 15); P("M456 384 q6 -16 12 -2"); P("M462 362 v-14 l-4 4 m4 -4 l4 4");
  // Person with watering can · trash can
  person(565, 360, 1, "reach", -1); P("M548 336 l-10 6 m-4 0 l2 4 l8 -4z", "fl");
  P("M528 290 h20 l-3 22 h-14z M526 290 h24", "fl"); P("M584 342 h20 l-3 22 h-14z M582 342 h24", "fl");
  // Cow · goat · person on a wheel
  const cow = (x, y, s, fl = 1) => {
    P(`M${x} ${y} h${30 * s * fl} v${-14 * s} h${-30 * s * fl}z`, "fl");
    P(`M${x + 30 * s * fl} ${y - 14 * s} l${8 * s * fl} ${-4 * s} l${4 * s * fl} ${8 * s} l${-6 * s * fl} ${4 * s}`, "fl");
    P(`M${x + 3 * s * fl} ${y} v${10 * s} M${x + 9 * s * fl} ${y} v${10 * s} M${x + 22 * s * fl} ${y} v${10 * s} M${x + 28 * s * fl} ${y} v${10 * s} M${x} ${y - 12 * s} l${-6 * s * fl} ${8 * s}`);
    P(`M${x + 8 * s * fl} ${y - 14 * s} q${4 * s * fl} ${6 * s} ${10 * s * fl} 0`, "dk");
  };
  cow(784, 296, 1.25, 1); cow(810, 334, 0.8, 1); cow(756, 330, 0.55, -1); cow(704, 268, 0.6, 1);
  C(716, 318, 10); C(736, 322, 8); person(724, 312, 0.8, "sit");
  P("M690 302 l-14 -12 m0 0 v10 m0 -10 h10");
  // Kitchen, bin, flame icons
  R(640, 370, 62, 66); P("M640 384 h62 M670 370 v66"); R(628, 404, 22, 30); E(639, 404, 11, 3);
  C(668, 360, 12); P("M664 364 q4 -14 8 0z", "dk"); C(610, 384, 12); P("M606 388 q4 -12 8 0z", "fl");
  P("M688 354 l12 -10 m-6 12 l14 -6");
  // Four recycling bins
  for (let k = 0; k < 4; k++) { R(782 + k * 22, 372 + k * 8, 20, 40); R(786 + k * 22, 392 + k * 8, 12, 12); }
  person(770, 440, 1, "stand"); person(712, 486, 0.9, "sit");
  P("M700 458 h70 M708 458 v32 M762 458 v32", "ln"); person(736, 456, 0.9, "arms");
  C(808, 482, 9); C(808, 482, 3, "dk"); person(806, 474, 0.85, "sit"); person(826, 472, 0.95, "reach", -1);
  // Family (adult carrying a child on shoulders, children)
  person(585, 486, 1.1, "walk"); person(585, 452, 0.6, "arms"); person(614, 490, 0.75, "walk", -1); person(628, 470, 0.7, "arms");
  for (let k = 0; k < 14; k++) grass(380 + rnd() * 460, 330 + rnd() * 150, 0.8);

  // ── Center island: industrial city ──
  const chimney = (x, y, h) => { P(`M${x - 9} ${y} l3 ${-h} h12 l3 ${h}z`, "fl"); P(`M${x - 8} ${y - h * 0.3} h16 M${x - 7} ${y - h * 0.6} h14`); };
  chimney(340, 664, 78); chimney(376, 664, 92);
  P("M326 572 c-10 -6 -6 -20 6 -18 c2 -12 18 -10 18 0 c10 -2 12 12 4 16z M358 556 c-10 -6 -6 -20 6 -18 c2 -12 18 -10 18 0 c10 -2 12 12 4 16z", "fl");
  P("M348 700 v-44 l22 -16 v16 l22 -16 v16 l22 -16 v16 l22 -16 v60z", "fl");
  for (let k = 0; k < 4; k++) R(356 + k * 22, 672, 10, 12);
  T(292, 594, "CO₂", 18); P("M332 582 v14 m-5 -5 l5 5 l5 -5");
  C(416, 612, 18, "ds"); P("M404 600 l-4 -6 m4 6 l6 -2");
  const turbine = (x, y, h, a) => { P(`M${x} ${y} v${-h}`); for (let k = 0; k < 3; k++) { const t = a + (k * Math.PI * 2) / 3; P(`M${x} ${y - h} l${Math.cos(t) * 20} ${Math.sin(t) * 20}`); } };
  turbine(410, 548, 52, -1.4); turbine(440, 556, 58, -1.2); turbine(476, 560, 56, -1.6);
  P("M452 520 q6 -10 12 -4 q6 -10 12 -4", "ln");
  C(512, 554, 16); P("M512 570 q10 20 32 34"); P("M500 548 q12 -8 24 0");
  const building = (x, y, w, h, cols, rows) => { R(x, y - h, w, h); for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) R(x + 5 + i * ((w - 10) / cols), y - h + 8 + j * ((h - 16) / rows), (w - 10) / cols - 4, (h - 16) / rows - 5); };
  building(532, 700, 46, 118, 3, 7); building(586, 704, 42, 72, 3, 4); P("M532 582 l8 -10 h30 l8 10", "fl");
  E(620, 540, 52, 34); P("M600 572 l-6 14 l18 -12", "fl"); E(620, 540, 52, 34, "ln");
  R(626, 520, 22, 14); P("M598 552 h40"); C(604, 542, 5); C(620, 538, 5); C(636, 544, 5);
  P("M298 712 h48 v-20 h-34 l-14 10z", "fl"); C(310, 714, 6); C(336, 714, 6);
  [[300, 676, "round"], [470, 652, "round"], [490, 676, "round"], [448, 712, "round"], [520, 712, "round"], [548, 716, "round"], [296, 640, "round"]].forEach(([x, y, k]) => tree(x, y, 0.8, k));
  bird(264, 560); bird(276, 586);
  P("M290 500 h40 v20 h-40z", "fl"); person(312, 498, 0.9, "sit"); R(318, 474, 12, 8);
  // Kite, swing, person jumping down
  P("M184 504 l-14 26 l14 30 l14 -30z", "fl"); P("M184 560 C200 600 240 640 258 650");
  person(262, 664, 0.9, "arms");
  P("M748 506 l10 86 M778 506 l-10 86 M752 592 h22"); person(762, 590, 0.8, "sit");
  P("M792 506 l26 58 M808 504 l18 52"); person(822, 572, 0.85, "run", -1);
  person(716, 652, 0.95, "arms", -1);

  // ── People on the left of the path ──
  person(124, 606, 1, "walk"); person(140, 604, 0.95, "walk");
  person(132, 716, 1.05, "run", -1);
  C(130, 870, 12); C(160, 876, 12); P("M130 870 l16 -14 l14 20 m-16 -20 l-4 -8"); person(146, 856, 0.8, "sit");
  P("M216 432 l40 -28 l14 14 l-40 28z", "fl"); C(230, 452, 6); C(262, 432, 6);

  // ── Lower island: forest · sea · picnic ──
  for (let k = 0; k < 9; k++) tree(262 + (k % 5) * 18 + (k > 4 ? 9 : 0), 922 - (k > 4 ? 40 : 0), 1, "poplar");
  P("M350 870 h26 v-12 h-26z", "fl"); P("M352 870 v14 M372 870 v14 M376 858 l6 -14 m-4 6 l-6 -6 m10 0 l6 -6");
  P("M232 812 l34 -26 l34 26 v40 h-68z", "fl"); P("M226 814 l40 -32 l40 32"); R(250, 822, 12, 12); R(272, 822, 12, 12);
  C(258, 748, 24); person(258, 766, 0.6, "sit");
  tree(430, 936, 1.3, "big");
  person(384, 966, 0.9, "reach"); P("M396 942 l14 -18 a6 6 0 1 1 8 4");
  person(440, 968, 0.75, "run"); person(462, 960, 0.75, "arms");
  P("M478 972 v-26 h36 v26 M478 956 h36");
  P("M456 800 h56 l-10 12 h-40z", "fl"); P("M472 800 v-10 h16 v10");
  P("M508 806 h54 l-8 10 h-40z M534 806 v-46 l24 40z", "fl");
  P("M486 820 q16 6 32 16");
  E(526, 860, 40, 9, "ln"); E(612, 884, 52, 12, "ln");
  for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; C(526 + Math.cos(a) * 40, 860 + Math.sin(a) * 9, 3); C(612 + Math.cos(a) * 52, 884 + Math.sin(a) * 12, 3); }
  P("M500 940 C560 922 660 920 700 932 C740 944 760 966 762 990", "ln");
  P("M590 966 l14 -12 h70 l-10 14z", "fl"); person(604, 960, 0.8, "sit"); person(630, 956, 0.85, "arms"); person(654, 962, 0.8, "sit", -1);
  P("M544 950 q-6 -10 2 -12 q6 0 4 6 h8 q-2 10 -14 6z", "fl");
  C(690, 816, 12); person(690, 864, 0.9, "reach"); person(708, 866, 0.9, "stand"); P("M676 864 h52 v6 h-52z", "fl");
  P("M712 946 q-8 -20 6 -30 m-6 30 q10 -18 22 -20 m-16 20 q0 -20 -16 -26");
  [[410, 790], [440, 772], [576, 772], [602, 790]].forEach(([x, y]) => bird(x, y, 1.1));
  for (let k = 0; k < 16; k++) wave(420 + rnd() * 300, 820 + rnd() * 90);
  for (let k = 0; k < 10; k++) grass(330 + rnd() * 400, 900 + rnd() * 60, 0.8);
  // Performers on the right edge
  P("M690 784 l22 -26 l20 16 l-22 26z", "fl"); person(722, 790, 0.85, "reach", -1);
  person(770, 800, 0.95, "reach"); P("M780 776 q6 10 2 18");
  person(792, 858, 0.9, "arms");
  P("M712 744 v-8 l8 -2 v8 M736 742 v-10 l6 6");
  T(802, 790, "♪", 18);

  // ── Bottom: flowers and seeds, a person watering from a ladder ──
  flowerTop(182, 966, 24);
  E(470, 1188, 40, 5, "ln");
  P("M462 1086 C420 1090 410 1140 430 1170 C446 1192 500 1192 510 1160 C520 1124 500 1088 462 1086z", "fl");
  P("M462 1086 q-24 -16 -18 -34 q18 2 18 34 q14 -22 30 -18 q-4 16 -30 18", "fl");
  P("M504 1188 l20 -100 M524 1190 l20 -100 M507 1172 h20 M511 1152 h20 M515 1132 h20 M519 1112 h20");
  person(522, 1088, 0.95, "reach", -1);
  for (let k = 0; k < 6; k++) C(470 + k * 6 - rnd() * 4, 1068 + rnd() * 12, 1.6, "dk");
  P("M530 1070 C560 1110 520 1180 548 1186 C568 1190 562 1168 576 1166");
  person(580, 1192, 0.7, "stand");
})();
