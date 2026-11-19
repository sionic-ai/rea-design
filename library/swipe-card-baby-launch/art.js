// Recreates with our own shapes the 8 nature icons, 9 bath card illustrations and 3 sets of ”Back to top” that the original plays via Lottie (lottie-web 5.12.2) — the original JSON is not used.
// Panel size, 60fps and lengths (icon 120 frames, card 180 frames, entering at top 60 · staying 180 · leaving 60) are the same as the original.
// Fill is a gray number + class (f-<Name>) only, and shared.css paints it with --kf-*. So that it also runs on file://, animationData is built here instead of using a JSON file.
(() => {
  const FR = 60;
  const GRAY = [0.5, 0.5, 0.5, 1];
  const st = (v) => ({ a: 0, k: v });
  const ease = { o: { x: [0.42], y: [0] }, i: { x: [0.58], y: [1] } };
  const keys = (pairs) => ({ a: 1, k: pairs.map(([t, v], i) => (i < pairs.length - 1 ? { t, s: [].concat(v), ...ease } : { t, s: [].concat(v) })) });
  const tr = (o = {}) => ({ ty: "tr", p: o.p || st(o.at || [0, 0]), a: st(o.anchor || o.at || [0, 0]), s: o.s || st([100, 100]), r: o.r || st(0), o: o.o || st(100), sk: st(0), sa: st(0) });
  const fill = (c, op = 100) => ({ ty: "fl", c: st(GRAY), o: st(op), r: 1, cl: "f-" + c });
  const E = (x, y, w, h) => ({ ty: "el", p: st([x, y]), s: st([w, h]), d: 1 });
  const R = (x, y, w, h, r = 0) => ({ ty: "rc", p: st([x + w / 2, y + h / 2]), s: st([w, h]), r: st(r), d: 1 });
  const P = (pts) => ({ ty: "sh", ks: st({ i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]), v: pts, c: true }) });
  const tri = (cx, by, w, h) => P([[cx, by - h], [cx + w / 2, by], [cx - w / 2, by]]);
  const part = (c, geo, o = {}) => ({ ty: "gr", nm: c, it: [...[].concat(geo), fill(c, o.op), tr(o)] });
  const layer = (nm, shapes, op, o = {}) => ({ ddd: 0, ind: o.ind || 1, ty: 4, nm, sr: 1, ks: { o: st(100), r: st(0), p: st([0, 0, 0]), a: st([0, 0, 0]), s: st([100, 100, 100]) }, ao: 0, shapes: shapes.slice().reverse(), ip: 0, op, st: 0, bm: 0 });
  const anim = (w, h, op, shapes) => ({ v: "5.12.2", fr: FR, ip: 0, op, w, h, nm: "kf", ddd: 0, assets: [], layers: [layer("art", shapes, op)] });

  // Icon — 35×35, repeats every 2s. Each shape stretches, shrinks or sways slightly on its base axis
  const N = 120;
  const bob = (sy = 112, ph = 0) => keys([[0, [100, 100]], [30 + ph, [96, sy]], [60 + ph, [100, 100]], [N, [100, 100]]]);
  const sway = (deg, ph = 0) => keys([[0, 0], [30 + ph, deg], [90 + ph, -deg], [N, 0]]);
  const ICON = {
    mountain: () => [
      part("green", tri(14, 30, 22, 22), { at: [14, 30], s: bob() }),
      part("mint", tri(25, 30, 14, 14), { at: [25, 30], s: bob(120, 20) }),
    ],
    sunset: () => [
      part("dark", R(16, 17, 3, 13, 1.5)),
      part("green", P([[5, 18], [9, 9], [17, 5], [25, 9], [29, 18]]), { at: [17, 18], r: sway(8) }),
    ],
    tree: () => [
      part("green", [tri(11, 21, 12, 13), R(9.5, 20, 3, 10)], { at: [11, 30], p: keys([[0, [11, 30]], [30, [11, 27]], [60, [11, 30]], [N, [11, 30]]]) }),
      part("mint", [tri(24, 21, 12, 13), R(22.5, 20, 3, 10)], { at: [24, 30], p: keys([[0, [24, 30]], [60, [24, 30]], [90, [24, 27]], [N, [24, 30]]]) }),
    ],
    sunrise: () => [
      part("yellow", E(17.5, 14, 10, 10), { at: [17.5, 14], p: keys([[0, [17.5, 16]], [60, [17.5, 11]], [N, [17.5, 16]]]) }),
      part("green", tri(11, 31, 18, 16)),
      part("mint", tri(23, 31, 18, 20)),
    ],
    flower: () => [
      part("soft", E(17.5, 17.5, 28, 28), { at: [17.5, 17.5], s: keys([[0, [100, 100]], [60, [88, 88]], [N, [100, 100]]]) }),
      part("green", E(17.5, 17.5, 16, 16), { at: [17.5, 17.5], s: keys([[0, [100, 100]], [60, [120, 120]], [N, [100, 100]]]) }),
      part("yellow", E(17.5, 17.5, 6, 6)),
    ],
    ribbon: () => [
      part("green", P([[17.5, 15], [6, 8], [6, 22]]), { at: [17.5, 15], r: sway(-10) }),
      part("green", P([[17.5, 15], [29, 8], [29, 22]]), { at: [17.5, 15], r: sway(10) }),
      part("dark", [P([[17.5, 15], [12, 31], [16, 30]]), P([[17.5, 15], [23, 31], [19, 30]])]),
      part("mint", E(17.5, 15, 6, 6)),
    ],
    conifer: () => [
      part("dark", R(16, 26, 3, 6)),
      part("green", [tri(17.5, 27, 18, 12), tri(17.5, 20, 14, 11), tri(17.5, 13, 10, 9)], { at: [17.5, 27], r: sway(6) }),
    ],
    broadleaf: () => [
      part("dark", R(16, 20, 3, 12)),
      part("green", E(17.5, 14, 22, 20), { at: [17.5, 22], s: bob(108) }),
      part("mint", E(11, 12, 8, 8), { at: [11, 12], p: keys([[0, [11, 12]], [60, [10, 10]], [N, [11, 12]]]) }),
    ],
  };

  // Bath card art — 285×164, 3s loop. Tub, water and baby face stay the same, only the props (bubbles, cup, towel, bottle) differ per step
  const M = 180;
  const rise = (x, y0, d, ph) => keys([[0, [x, y0]], [ph, [x, y0]], [ph + d, [x + 6, y0 - 46]], [M, [x + 6, y0 - 46]]]);
  const fade = (ph, d) => keys([[0, 0], [ph, 0], [ph + 10, 100], [ph + d - 10, 100], [ph + d, 0], [M, 0]]);
  const bubble = (x, y, r, ph) => part("sky", E(0, 0, r, r), { at: [0, 0], p: rise(x, y, 70, ph), o: fade(ph, 70) });
  const PROPS = [
    () => [part("yellow", tri(70, 50, 12, 12), { at: [70, 44], r: keys([[0, 0], [M, 360]]) }), part("green", R(212, 40, 9, 9, 2), { at: [216, 44], r: keys([[0, 0], [M, -360]]) })],
    () => [part("yellow", E(70, 44, 20, 20)), part("dark", R(206, 30, 4, 22, 2))],
    () => [part("surface", R(196, 64, 46, 28, 6), { at: [219, 78], r: keys([[0, -6], [90, 6], [M, -6]]) }), part("mint", R(52, 54, 18, 30, 6))],
    () => [part("surface", E(176, 70, 34, 22), { at: [176, 70], p: keys([[0, [170, 70]], [90, [186, 66]], [M, [170, 70]]]) })],
    () => [part("surface", E(112, 92, 28, 18), { at: [112, 92], p: keys([[0, [108, 96]], [90, [122, 90]], [M, [108, 96]]]) })],
    () => [part("surface", E(176, 100, 30, 18), { at: [176, 100], p: keys([[0, [172, 104]], [90, [186, 98]], [M, [172, 104]]]) })],
    () => [part("mint", R(196, 26, 22, 26, 4), { at: [207, 52], r: keys([[0, 0], [60, -40], [120, -40], [M, 0]]) })],
    () => [part("soft", R(186, 40, 56, 40, 10), { at: [214, 60], p: keys([[0, [214, 60]], [90, [208, 56]], [M, [214, 60]]]) })],
    () => [part("mint", R(52, 46, 26, 46, 8)), part("surface", R(206, 40, 26, 52, 8))],
  ];
  const card = (step) => [
    part("soft", E(142, 112, 210, 74)),
    part("sky", E(142, 108, 184, 54)),
    part("surface", E(142, 72, 46, 44), { at: [142, 96], r: keys([[0, -4], [90, 4], [M, -4]]) }),
    part("dark", [E(134, 72, 3, 4), E(150, 72, 3, 4)], { at: [142, 96], r: keys([[0, -4], [90, 4], [M, -4]]) }),
    ...PROPS[step](),
    bubble(98, 104, 10, 0), bubble(186, 108, 8, 50), bubble(120, 110, 6, 100), bubble(168, 104, 12, 140),
  ];

  // Back to top — 130×200. Moves the two mountains as one group (values measured from the original):
  // Enter (1s) from lower left (−12, +62), rising slightly past its spot at .35s and settling, ending with an 11° tilt · Stay (3s loop) swings 11° ↔ −11° every .48s · Exit (1s) sinks to lower left (−15, +61)
  // Set the group’s pivot at the floor center (0,0) so the position value is the movement amount (the original measures it that way too)
  const B = (p, r) => [{
    ty: "gr", nm: "b2t",
    it: [part("mint", tri(23, 0, 46, 44)), part("green", tri(-9, 0, 74, 66)), tr({ p, r })],
  }];
  // Curves measured from the original are set frame by frame and joined with keys that have no curve
  const lin = (pairs) => ({ a: 1, k: pairs.map(([t, v], i) => (i < pairs.length - 1 ? { t, s: [].concat(v), o: { x: [0], y: [0] }, i: { x: [1], y: [1] } } : { t, s: [].concat(v) })) });
  // Exit position — ratio against the farthest point (−14.6, +60.2) per frame (original measured time series shifted to frame times)
  const OUT = [-0.01, -0.03, -0.045, -0.055, -0.065, -0.07, -0.07, -0.075, -0.08, -0.08, -0.035, 0.09, 0.25, 0.42, 0.57, 0.71, 0.82, 0.91, 0.96, 1, 0.99, 0.96, 0.925, 0.895, 0.875, 0.875, 0.89, 0.91, 0.925, 0.935, 0.94];
  const outAt = (f) => [+(65 - 14.6 * f).toFixed(2), +(150 + 60.2 * f).toFixed(2)];
  const b2t = {
    b2t_in: () => anim(130, 200, 60, B(keys([[0, [53, 212]], [21, [66, 145]], [39, [65, 150]], [60, [65, 150]]]), keys([[0, 0], [39, 0], [60, 11]]))),
    // Linger: a straight triangle wave (11° → −11° → 11° in .5s), starting after one frame’s rest as in the original
    b2t_hover: () => anim(130, 200, 180, B(st([65, 150]), lin([[0, 11], [1, 11], [15, -11], [30, 11], [180, 11]]))),
    // Exit — lifts 5px for the first .15s, then drops with a thud to the lower left (−15, +61) in .19s, bounces up 6% and settles,
    // The tilt swings from 11° to −5° after .17s, then returns to 0°
    b2t_out: () => anim(130, 200, 60, B(
      lin([...OUT.map((f, t) => [t, outAt(f)]), [60, outAt(OUT[OUT.length - 1])]]),
      lin([[0, 11], [10, 11], [12, 8.6], [15, 3], [18, -2.6], [20, -5], [24, 1.4], [27, 1.7], [30, 0], [60, 0]]),
    )),
  };

  const out = { ...b2t };
  for (const name of Object.keys(ICON)) out[name] = () => anim(35, 35, N, ICON[name]());
  for (let i = 0; i < PROPS.length; i++) out["step0" + i] = () => anim(285, 164, M, card(i));
  window.bsArt = out;
})();
