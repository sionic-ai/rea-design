/* Hero piece illustrations — hand, leaf, flower, bird, fish, house, tree, note, apple, clover, person, flame, lightning, drop, heart, dot.
   Drawn as a silhouette in a 100×100 box and filled with a gradient between two accent colors. Our own shape of the same kind and size in place of the original image */
(() => {
  const P = Math.PI;
  const ell = (c, x, y, rx, ry, r = 0) => { c.moveTo(x + rx * Math.cos(r), y + rx * Math.sin(r)); c.ellipse(x, y, rx, ry, r, 0, P * 2); };
  const cut = (c, fn) => { c.save(); c.globalCompositeOperation = "destination-out"; c.beginPath(); fn(); c.fill(); c.restore(); };
  const cutStroke = (c, w, fn) => { c.save(); c.globalCompositeOperation = "destination-out"; c.lineWidth = w; c.lineCap = "round"; c.beginPath(); fn(); c.stroke(); c.restore(); };
  const poly = (c, pts) => { c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); };

  const SHAPES = {
    heart(c) { c.beginPath(); c.moveTo(50, 90); c.bezierCurveTo(8, 62, 2, 34, 20, 20); c.bezierCurveTo(34, 9, 47, 16, 50, 30); c.bezierCurveTo(53, 16, 66, 9, 80, 20); c.bezierCurveTo(98, 34, 92, 62, 50, 90); c.fill(); },
    flower(c) { c.beginPath(); for (let k = 0; k < 5; k++) { const a = (k * 2 * P) / 5 - P / 2; ell(c, 50 + 24 * Math.cos(a), 50 + 24 * Math.sin(a), 19, 19); } c.fill(); cut(c, () => ell(c, 50, 50, 8, 8)); },
    leaf(c) { c.beginPath(); c.moveTo(50, 4); c.quadraticCurveTo(94, 48, 50, 96); c.quadraticCurveTo(6, 48, 50, 4); c.fill(); cutStroke(c, 3, () => { c.moveTo(50, 22); c.lineTo(50, 86); c.moveTo(50, 46); c.lineTo(66, 34); c.moveTo(50, 62); c.lineTo(34, 50); }); },
    sprig(c) {
      c.lineWidth = 5; c.lineCap = "round"; c.beginPath(); c.moveTo(48, 98); c.quadraticCurveTo(58, 50, 50, 4); c.stroke();
      c.beginPath();
      [[50, 18, -0.8], [54, 36, 0.9], [52, 54, -0.9], [54, 72, 0.8]].forEach(([x, y, r]) => ell(c, x + Math.sign(r) * 13, y, 15, 7, r));
      c.fill();
    },
    drop(c) { c.beginPath(); c.moveTo(50, 4); c.bezierCurveTo(62, 30, 80, 48, 80, 66); c.arc(50, 66, 30, 0, P, false); c.bezierCurveTo(20, 48, 38, 30, 50, 4); c.fill(); },
    flash(c) { const pts = []; for (let k = 0; k < 16; k++) { const a = (k * P) / 8, r = k % 2 ? 17 : 44 + ((k * 7) % 5); pts.push(50 + r * Math.cos(a), 50 + r * Math.sin(a)); } c.beginPath(); poly(c, pts); c.fill(); cut(c, () => ell(c, 50, 50, 6, 6)); },
    fish(c) { c.beginPath(); ell(c, 42, 50, 32, 18); c.fill(); c.beginPath(); poly(c, [68, 50, 97, 28, 92, 50, 97, 72]); c.fill(); cut(c, () => ell(c, 24, 45, 4.5, 4.5)); },
    bird(c) {
      c.beginPath(); ell(c, 48, 60, 28, 15, -0.25); ell(c, 24, 46, 12, 12); c.fill();
      c.beginPath(); poly(c, [13, 43, 2, 48, 14, 50]); c.fill();
      c.beginPath(); c.moveTo(40, 54); c.quadraticCurveTo(58, 6, 84, 14); c.quadraticCurveTo(70, 36, 62, 60); c.closePath(); c.fill();
      c.beginPath(); poly(c, [70, 64, 98, 58, 94, 80]); c.fill();
      cut(c, () => ell(c, 21, 44, 3, 3));
    },
    hand(c) {
      c.beginPath(); c.roundRect(26, 44, 48, 48, 18);
      [[28, 14, 34], [40, 6, 42], [52, 8, 40], [64, 16, 32]].forEach(([x, y, h]) => c.roundRect(x, y, 10, h, 5));
      c.fill();
      c.save(); c.translate(26, 62); c.rotate(-0.7); c.beginPath(); c.roundRect(-28, -6, 30, 11, 5.5); c.fill(); c.restore();
      cut(c, () => { c.moveTo(50, 80); c.bezierCurveTo(38, 72, 40, 62, 46, 62); c.bezierCurveTo(49, 62, 50, 65, 50, 66); c.bezierCurveTo(50, 65, 51, 62, 54, 62); c.bezierCurveTo(60, 62, 62, 72, 50, 80); });
    },
    house(c) { c.beginPath(); poly(c, [50, 6, 94, 44, 84, 44, 84, 94, 16, 94, 16, 44, 6, 44]); c.fill(); cut(c, () => { c.rect(37, 54, 12, 12); c.rect(51, 54, 12, 12); c.rect(37, 68, 12, 12); c.rect(51, 68, 12, 12); }); },
    tree(c) { c.beginPath(); poly(c, [50, 2, 68, 28, 59, 28, 78, 54, 66, 54, 88, 82, 12, 82, 34, 54, 22, 54, 41, 28, 32, 28]); c.rect(44, 80, 12, 18); c.fill(); },
    note(c) { c.beginPath(); ell(c, 32, 78, 16, 12, -0.4); c.rect(42, 12, 7, 64); c.fill(); c.beginPath(); c.moveTo(46, 12); c.quadraticCurveTo(82, 22, 78, 52); c.quadraticCurveTo(72, 32, 46, 32); c.closePath(); c.fill(); },
    apple(c) { c.beginPath(); ell(c, 37, 60, 27, 30); ell(c, 63, 60, 27, 30); c.fill(); c.beginPath(); ell(c, 64, 18, 14, 6, -0.6); c.fill(); c.lineWidth = 4; c.lineCap = "round"; c.beginPath(); c.moveTo(50, 32); c.lineTo(52, 16); c.stroke(); },
    clover(c) { c.beginPath(); ell(c, 50, 28, 19, 19); ell(c, 29, 60, 19, 19); ell(c, 71, 60, 19, 19); c.fill(); c.lineWidth = 6; c.lineCap = "round"; c.beginPath(); c.moveTo(50, 52); c.quadraticCurveTo(54, 80, 64, 96); c.stroke(); },
    human(c) {
      c.beginPath(); ell(c, 58, 13, 10, 10); c.fill();
      c.lineWidth = 10; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath();
      c.moveTo(55, 28); c.lineTo(47, 58); c.lineTo(32, 92); c.moveTo(47, 58); c.lineTo(64, 90); c.moveTo(53, 36); c.lineTo(36, 52); c.moveTo(53, 36); c.lineTo(70, 48);
      c.stroke();
    },
    fire(c) { c.beginPath(); c.moveTo(50, 97); c.bezierCurveTo(16, 92, 10, 60, 30, 38); c.bezierCurveTo(34, 54, 42, 52, 40, 28); c.bezierCurveTo(54, 38, 62, 20, 58, 3); c.bezierCurveTo(84, 24, 92, 62, 78, 84); c.bezierCurveTo(72, 93, 61, 97, 50, 97); c.fill(); cut(c, () => { c.moveTo(50, 90); c.bezierCurveTo(38, 86, 38, 72, 48, 62); c.bezierCurveTo(52, 72, 62, 74, 58, 86); c.closePath(); }); },
    dot(c) { c.beginPath(); ell(c, 50, 50, 26, 26); c.fill(); },
  };
  const NAMES = Object.keys(SHAPES);

  // Each piece gets a gradient between two accent colors — the angle is split in two so the same shapes are painted differently
  function textures(THREE, colA, colB) {
    const out = {};
    for (const name of NAMES) {
      out[name] = [0, 1].map((v) => {
        const cv = document.createElement("canvas");
        cv.width = cv.height = 128;
        const c = cv.getContext("2d");
        c.scale(1.28, 1.28);
        const g = v ? c.createLinearGradient(0, 100, 100, 0) : c.createLinearGradient(0, 0, 100, 100);
        g.addColorStop(0, v ? colB : colA);
        g.addColorStop(1, v ? colA : colB);
        c.fillStyle = g;
        c.strokeStyle = g;
        SHAPES[name](c);
        const t = new THREE.CanvasTexture(cv);
        t.anisotropy = 4;
        return t;
      });
    }
    return out;
  }

  // Logo mark — draws a swarm of pieces densely inside a tilted rounded blob (header·menu·footer logo spots)
  function cluster(cv, colA, colB) {
    const r = cv.getBoundingClientRect();
    const dpr = Math.min(2, devicePixelRatio || 1);
    const w = Math.max(1, r.width), h = Math.max(1, r.height);
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    const c = cv.getContext("2d");
    c.scale(dpr, dpr);
    c.save();
    c.beginPath();
    c.ellipse(w / 2, h / 2, w * 0.48, h * 0.42, -0.18, 0, P * 2);
    c.clip();
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const s = Math.min(w, h) * 0.34;
    for (let y = -s * 0.3; y < h + s * 0.3; y += s * 0.55) {
      for (let x = -s * 0.3; x < w + s * 0.3; x += s * 0.6) {
        const name = NAMES[Math.floor(rnd() * NAMES.length)];
        c.save();
        c.translate(x + rnd() * s * 0.3, y + rnd() * s * 0.3);
        c.rotate((rnd() - 0.5) * P);
        c.scale(s / 100, s / 100);
        c.translate(-50, -50);
        const g = c.createLinearGradient(0, 0, 100, 100);
        g.addColorStop(0, rnd() > 0.5 ? colA : colB);
        g.addColorStop(1, rnd() > 0.5 ? colB : colA);
        c.fillStyle = g; c.strokeStyle = g;
        SHAPES[name](c);
        c.restore();
      }
    }
    c.restore();
  }

  window.PsPieces = { NAMES, textures, cluster };
})();
