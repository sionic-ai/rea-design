/* Our own shapes, redrawn at the same board size, fps, length and key frames as the original’s two Lottie animations (menu bar sound wave, dock hamburger).
   Colors are not filled in here. shared.css applies them to the svg path with --kf-*, and the shapes are kept as data instead of a JSON file so it also opens over file://. */
(() => {
  const still = (k) => ({ a: 0, k });
  const ease = { o: { x: [0.333], y: [0] }, i: { x: [0.667], y: [1] } };
  const key = (t, s) => ({ t, s, ...ease });
  const layer = (ind, nm, ks, shapes, op) => ({
    ddd: 0, ind, ty: 4, nm, sr: 1, ao: 0, ip: 0, op, st: 0, bm: 0,
    ks: { o: still(100), r: still(0), p: still([0, 0, 0]), a: still([0, 0, 0]), s: still([100, 100, 100]), ...ks },
    shapes,
  });
  const tr = { ty: "tr", p: still([0, 0]), a: still([0, 0]), s: still([100, 100]), r: still(0), o: still(100), sk: still(0), sa: still(0) };
  const ink = { ty: "fl", c: still([0, 0, 0, 1]), o: still(100), r: 1 };
  const line = { ty: "st", c: still([0, 0, 0, 1]), o: still(100), w: still(16), lc: 2, lj: 1 };

  // Sound wave: seven bars rise and fall independently about 5 times per second over 8 seconds (480 frames), and the last frame equals the first so it loops seamlessly
  function waves() {
    let seed = 7;
    const rnd = (a, b) => { seed = (seed * 16807) % 2147483647; return a + ((seed - 1) / 2147483646) * (b - a); };
    const X = [40, 72, 103, 135, 166, 197, 229];
    const H = [46, 67, 67, 46, 67, 67, 51];
    const layers = X.map((x, i) => {
      const step = Math.round(60 / (5 * rnd(0.7, 1.3)));
      const amp = 80 * rnd(0.5, 1);
      const keys = [];
      const first = 100 + rnd(-amp, amp);
      for (let t = 0; t < 480; t += step) keys.push(key(t, [100, t === 0 ? first : Math.max(12, 100 + rnd(-amp, amp)), 100]));
      keys.push({ t: 480, s: [100, first, 100] });
      return layer(i + 1, `bar ${i + 1}`, { p: still([x, 80, 0]), s: { a: 1, k: keys } }, [
        { ty: "gr", it: [{ ty: "rc", d: 1, s: still([12.5, H[i]]), p: still([0, 0]), r: still(20) }, ink, tr] },
      ], 480);
    });
    return { v: "5.12.2", fr: 60, ip: 0, op: 480, w: 270, h: 160, nm: "waves", ddd: 0, assets: [], layers };
  }

  // Hamburger: in frames 0~15 the top and bottom lines gather to center and the middle line vanishes, then in frames 15~30 they rotate ±45° into an X. Frames 45~75 run in reverse
  function burger() {
    const bar = (ind, nm, y, deg) => layer(ind, nm, {
      p: { a: 1, k: [key(0, [88.5, y, 0]), key(15, [88.5, 63, 0]), key(58, [88.5, 63, 0]), key(60, [88.5, 63, 0]), { t: 75, s: [88.5, y, 0] }] },
      r: { a: 1, k: [key(15, [0]), key(30, [deg]), key(45, [deg]), { t: 60, s: [0] }] },
    }, [{ ty: "gr", it: [{ ty: "sh", ks: still({ i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]], v: [[-80.5, 0], [80.5, 0]], c: false }) }, line, tr] }], 300);
    const mid = layer(2, "middle", {
      p: still([88.5, 63, 0]),
      o: { a: 1, k: [key(13, [100]), key(15, [0]), key(60, [0]), { t: 62, s: [100] }] },
    }, [{ ty: "gr", it: [{ ty: "sh", ks: still({ i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]], v: [[-80.5, 0], [80.5, 0]], c: false }) }, line, tr] }], 300);
    return { v: "5.12.2", fr: 60, ip: 0, op: 97, w: 177, h: 126, nm: "burger", ddd: 0, assets: [], layers: [bar(1, "top", 13, 45), mid, bar(3, "bottom", 113, -45)] };
  }

  window.G_LOTTIE = { waves, burger };
})();
