// Hand-drawn lines over photos — the original drew and erased emphasis lines, wrinkles and outlines around the two people in the photo with lottie-web (svg).
// Don’t use the original JSON, same version (30fps, 150 frames = 5s, stroke width 2, round caps) same draw and erase window, same curve (o .55,.06 → i .36,1)
// Bake our strokes into Lottie data. The photo is a placeholder so stroke shape and position are ours — once a photo is added, only the POS positions shift to fit the person.
(() => {
  // [draw start, draw end, erase start, erase end] frames — the window in which the original lines are drawn
  const WIN = [[0, 30, 60, 90], [18, 39, 57, 78], [11, 26, 61, 75], [12, 42, 48, 84], [0, 24, 66, 90], [19, 22, 68, 71], [1, 22, 71, 90], [24, 36, 50, 64], [24, 36, 67, 81]];
  // Panel size is the same as the original image panel (photo ratio). Positions are ratios of the panel [x, y, kind, direction°]
  const COMP = {
    kv0: { w: 456, h: 456, pos: [[0.64, 0.24, "effect", -60], [0.3, 0.44, "wrinkle", 0]] },
    kv1: { w: 456, h: 456, pos: [[0.5, 0.33, "halo", 0], [0.78, 0.2, "effect", -40], [0.24, 0.52, "wrinkle", 0]] },
    kv2: { w: 456, h: 456, pos: [[0.3, 0.22, "effect", -135], [0.72, 0.3, "effect", -45], [0.55, 0.4, "halo", 0], [0.42, 0.64, "wrinkle", 0]] },
    intro1: { w: 280, h: 185, pos: [[0.58, 0.3, "halo", 0], [0.76, 0.2, "effect", -40], [0.42, 0.52, "wrinkle", 0]] },
    intro2: { w: 782, h: 566, pos: [[0.22, 0.3, "halo", 0], [0.12, 0.18, "effect", -140], [0.5, 0.26, "effect", -60], [0.62, 0.36, "halo", 0], [0.78, 0.22, "effect", -30], [0.36, 0.5, "wrinkle", 0]] },
    intro3: { w: 804, h: 557, pos: [[0.28, 0.28, "halo", 0], [0.16, 0.16, "effect", -130], [0.46, 0.2, "effect", -70], [0.7, 0.32, "halo", 0], [0.86, 0.2, "effect", -35], [0.3, 0.5, "wrinkle", 0], [0.66, 0.54, "wrinkle", 0]] },
    about: { w: 1520, h: 800, pos: [[0.2, 0.3, "halo", 0], [0.12, 0.16, "effect", -140], [0.3, 0.18, "effect", -50], [0.46, 0.34, "halo", 0], [0.52, 0.2, "effect", -60], [0.72, 0.28, "halo", 0], [0.86, 0.16, "effect", -35], [0.22, 0.5, "wrinkle", 0], [0.5, 0.52, "wrinkle", 0], [0.76, 0.5, "wrinkle", 0]] },
  };

  // Skin variable → 0–1 rgb for Lottie. Relative colors like oklch are read by painting a single point on a canvas
  const rgbOf = (name) => {
    const probe = document.createElement("i");
    probe.style.color = `var(${name})`;
    document.body.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255, 1];
  };

  // A Lottie path joining a few points with Catmull-Rom (tangents are relative to the vertex)
  const shape = (pts) => {
    const t = pts.map((p, i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      return [(b[0] - a[0]) / 6, (b[1] - a[1]) / 6];
    });
    return { a: 0, k: { c: false, v: pts, o: t, i: t.map(([x, y]) => [-x, -y]) } };
  };

  const strokes = (x, y, kind, dir, k, rnd) => {
    const rad = (d) => (d * Math.PI) / 180;
    if (kind === "effect") {
      // Three accent lines stretching above the head
      return [-28, 0, 28].map((d) => {
        const a = rad(dir + d + (rnd() - 0.5) * 8), r0 = k * 0.03, r1 = k * (0.075 + rnd() * 0.02);
        const m = (r0 + r1) / 2;
        return [[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a + 0.06) * m, y + Math.sin(a + 0.06) * m], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]];
      });
    }
    if (kind === "wrinkle") {
      // Two short smile lines on the cheek
      return [0, 1].map((n) => {
        const ox = x + n * k * 0.035, s = k * 0.03;
        return [[ox - s * 0.3, y - s], [ox + s * 0.35, y], [ox - s * 0.3, y + s]];
      });
    }
    // Outline circling the head, stopping short of a full turn
    const rx = k * 0.1, ry = k * 0.12, pts = [];
    for (let d = 200; d <= 500; d += 25) {
      const j = 1 + (rnd() - 0.5) * 0.08;
      pts.push([x + Math.cos(rad(d)) * rx * j, y + Math.sin(rad(d)) * ry * j]);
    }
    return [pts];
  };

  const ease = { o: { x: 0.55, y: 0.06 }, i: { x: 0.36, y: 1 } };
  const build = (key) => {
    const c = COMP[key];
    const k = Math.min(c.w, c.h);
    let seed = key.length * 97 + c.w;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const yellow = rgbOf("--kf-accent"), white = rgbOf("--kf-surface");
    const layers = [];
    c.pos.forEach(([fx, fy, kind, dir], n) => {
      const [t0, t1, t2, t3] = WIN[n % WIN.length];
      const color = n % 4 === 3 ? white : yellow;
      strokes(fx * c.w, fy * c.h, kind, dir, k, rnd).forEach((pts) => {
        layers.push({
          ddd: 0, ind: layers.length + 1, ty: 4, nm: kind, sr: 1, ao: 0, ip: 0, op: 150, st: 0, bm: 0,
          ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [0, 0, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] } },
          shapes: [{
            ty: "gr", nm: kind, it: [
              { ty: "sh", ks: shape(pts) },
              { ty: "st", c: { a: 0, k: color }, o: { a: 0, k: 100 }, w: { a: 0, k: 2 }, lc: 2, lj: 2, ml: 4 },
              { ty: "tm", m: 1, o: { a: 0, k: 0 }, e: { a: 1, k: [{ t: t0, s: [0], ...ease }, { t: t1, s: [100] }] }, s: { a: 1, k: [{ t: t2, s: [0], ...ease }, { t: t3, s: [100] }] } },
              { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } },
            ],
          }],
        });
      });
    });
    return { v: "5.12.0", fr: 30, ip: 0, op: 150, w: c.w, h: c.h, nm: key, ddd: 0, assets: [], layers };
  };

  // Fully drawn frame — a place to show a still in reduced-motion screens
  window.tgLines = (el, key, loop) => {
    const anim = lottie.loadAnimation({ container: el, renderer: "svg", loop, autoplay: false, animationData: build(key) });
    anim.still = () => anim.goToAndStop(45, true);
    return anim;
  };
})();
