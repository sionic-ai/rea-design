(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Cover on open — the original framer (v4) default opacity transition is .3s linear
  const veil = document.querySelector(".hm-veil");
  if (veil) {
    if (reduce) veil.style.display = "none";
    else gsap.to(veil, { autoAlpha: 0, duration: 0.3, ease: "none" });
  }

  // Skin variables (including oklch and color-mix) to 0~1 rgb that Lottie accepts — paint the computed color on a canvas and read it
  const pen = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgb = (css) => {
    pen.clearRect(0, 0, 1, 1);
    pen.fillStyle = css;
    pen.fillRect(0, 0, 1, 1);
    const d = pen.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255, 1];
  };

  // Logo Lottie — our speech-bubble face with the same timing as the original (222×76 · 60fps · 384-frame loop): frames 95~122 the face settles down,
  // Looks right at 161, left at 236, back in place at 322, both eyes blink around 167 and 256 (eye height 44% · width 109%), slight bobbing at 122~160 and 206~236
  const kf = (t, s, o = [0.167, 0], i = [0.58, 1]) => ({ t, s, o: { x: o[0], y: o[1] }, i: { x: i[0], y: i[1] }, to: [0, 0, 0], ti: [0, 0, 0] });
  const kfs = (t, s) => ({ t, s, o: { x: [0.333, 0.333], y: [0, 0] }, i: { x: [0.667, 0.667], y: [1, 1] } });
  const still = (k) => ({ a: 0, k });
  const tr = (p = [0, 0], s = still([100, 100])) => ({ ty: "tr", p: still(p), a: still(p), s, r: still(0), o: still(100), sk: still(0), sa: still(0) });
  const fill = (c) => ({ ty: "fl", c: still(c), o: still(100), r: 1, bm: 0 });
  const blink = (t1, t2) => ({ a: 1, k: [kfs(0, [100, 100]), kfs(t1, [100, 100]), kfs(t1 + 3, [109, 44]), kfs(t1 + 5, [109, 44]), kfs(t1 + 8, [100, 100]), kfs(t2, [100, 100]), kfs(t2 + 3, [109, 44]), kfs(t2 + 5, [109, 44]), { t: t2 + 8, s: [100, 100] }] });
  const eye = (x, t1, t2, c) => ({ ty: "gr", nm: "eye", it: [{ ty: "el", p: still([x, -5]), s: still([7, 10]), d: 1 }, fill(c), tr([x, -5], blink(t1, t2))] });
  const logoData = (bubble, face) => ({
    v: "5.6.7", fr: 60, ip: 0, op: 384, w: 222, h: 76, nm: "hm-logo", ddd: 0, assets: [],
    layers: [
      { ddd: 0, ind: 1, ty: 3, nm: "ctrl", sr: 1, ao: 0, ip: 0, op: 384, st: 0, bm: 0,
        ks: { o: still(0), r: still(0), s: still([100, 100, 100]), a: still([0, 0, 0]),
          p: { a: 1, k: [kf(0, [33, 33.5, 0]), kf(95, [33, 33.5, 0], [0.216, 0.216], [0.645, 0.645]), kf(122, [33, 33.5, 0], [0.196, 0], [0.141, 1]), kf(141, [33, 33.74, 0], [0.309, 0], [0.58, 1]), kf(160, [33, 33.5, 0]), kf(206, [33, 33.5, 0], [0.196, 0], [0.561, 1]), kf(221, [33, 33.74, 0], [0.309, 0], [0.58, 1]), kf(236, [33, 33.5, 0]), { t: 322, s: [33, 33.5, 0] }] } } },
      { ddd: 0, ind: 2, ty: 4, nm: "face", parent: 1, sr: 1, ao: 0, ip: 0, op: 384, st: 0, bm: 0,
        ks: { o: still(100), r: still(0), s: still([100, 100, 100]), a: still([0, 0, 0]),
          p: { a: 1, k: [kf(0, [0, -1.12, 0]), kf(95, [0, -1.12, 0], [0.167, 0], [0.637, 1]), kf(122, [0, -0.5, 0], [0.167, 0], [0.257, 1]), kf(161, [8.7, -0.7, 0]), kf(180, [8.7, -0.31, 0]), kf(206, [8.7, -0.31, 0], [0.187, 0], [0.658, 1]), kf(236, [-8.52, -0.7, 0], [0.167, 0], [0.658, 1]), kf(250, [-8.52, -0.31, 0], [0.167, 0], [0.658, 1]), kf(279, [-8.52, -0.31, 0], [0.167, 0], [0.833, 0.884]), kf(299, [-2.06, 0.88, 0], [0.167, 0.269], [0.58, 1]), { t: 322, s: [0, -1.12, 0] }] } },
        shapes: [
          eye(-8, 167, 256, face),
          eye(8, 167, 255, face),
          { ty: "gr", nm: "mouth", it: [{ ty: "sh", ks: still({ c: true, v: [[-11, 4], [11, 4], [0, 15]], i: [[0, 6.5], [0, 0], [6.5, 0]], o: [[0, 0], [0, 6.5], [-6.5, 0]] }) }, fill(face), tr()] },
        ] },
      { ddd: 0, ind: 3, ty: 4, nm: "bubble", sr: 1, ao: 0, ip: 0, op: 384, st: 0, bm: 0,
        ks: { o: still(100), r: still(0), s: still([100, 100, 100]), a: still([0, 0, 0]), p: still([33, 33.5, 0]) },
        shapes: [{ ty: "gr", nm: "bubble", it: [
          { ty: "el", p: still([0, 0]), s: still([62, 60]), d: 1 },
          { ty: "sh", ks: still({ c: true, v: [[-14, 22], [6, 28], [-7, 41]], i: [[0, 0], [0, 0], [-1, -1]], o: [[0, 0], [-3, 5], [0, 0]] }) },
          fill(bubble), tr()] }] },
    ],
  });

  document.querySelectorAll(".hm-logo__anim").forEach((box) => {
    if (!window.lottie) return;
    const cs = getComputedStyle(box);
    const anim = lottie.loadAnimation({
      container: box, renderer: "svg", loop: true, autoplay: !reduce,
      animationData: logoData(rgb(cs.color), rgb(cs.getPropertyValue("--site-logo-face").trim() || cs.backgroundColor)),
      rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
    });
    if (reduce) anim.goToAndStop(0, true);
    // Like the original react-lottie, click to pause and click again to resume
    const toggle = () => (anim.isPaused ? anim.play() : anim.pause());
    box.addEventListener("click", toggle);
    box.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
  });
})();
