/* Mascot crow — redraws the original frame image set and Lottie slot with our own shapes.
   One set of polygons is used three ways: SVG (still image), canvas (frames tied to scroll) and Lottie (a scene lottie-web steps through with scroll).
   Crow facing left, box 100×140, toe y=136. The caller reads colors from --kf-* and passes them in. */
(() => {
  // Feather tips must be jagged for the original’s fluffy texture — subdivide only the marked edges finely and push them alternately outward
  const jag = (pts, rough, amp = 2.4, step = 5) => {
    const out = [];
    const n = pts.length;
    let k = 0;
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      out.push(a);
      if (!rough[i]) continue;
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
      const cuts = Math.max(1, Math.round(len / step));
      const nx = dy / len, ny = -dx / len;
      for (let c = 1; c < cuts; c++) {
        const t = c / cuts, push = (k++ % 2 ? -0.35 : 1) * amp;
        out.push([a[0] + dx * t + nx * push, a[1] + dy * t + ny * push]);
      }
    }
    return out;
  };

  const R = 1, S = 0;
  const torso = jag(
    [[0, 34], [23, 18], [29, 10], [38, 4], [48, 4], [56, 11], [60, 22], [61, 33], [67, 45], [72, 60], [74, 76], [75, 90], [78, 104], [82, 121], [74, 123], [67, 111], [62, 102], [55, 100], [45, 102], [34, 95], [26, 81], [22, 64], [23, 49], [24, 42], [26, 38]],
    [S, R, R, S, R, R, R, R, R, R, R, R, R, S, R, R, R, R, R, R, R, R, R, S, S],
  );
  // Wings are drawn pointing up with the shoulder (0,0) as the axis — folded, they lie along the back toward the tail, spread, they stand up
  const wing = [[0, 0], [-9, -13], [-8, -33], [-3, -52], [4, -62], [6, -51], [11, -58], [13, -45], [18, -51], [19, -37], [24, -41], [23, -27], [28, -29], [23, -13], [13, 2]];
  const eye = [[32, 16], [42, 15], [45, 18], [40, 22], [33, 21]];
  const feathers = [[[47, 52], [58, 70]], [[44, 64], [57, 86]], [[49, 80], [60, 98]]];
  const legs = [[[46, 100], [44, 134]], [[55, 100], [57, 134]]];
  const toes = [[[44, 134], [36, 137]], [[44, 134], [47, 138]], [[57, 134], [49, 137]], [[57, 134], [62, 138]]];
  const HIP = [50, 100], SHOULDER = [52, 40];

  const poses = {
    stand: { rot: 0, x: 0, y: 0, wing: 158, far: 0, spread: 0, legs: 1, lift: 0 },
    crouch: { rot: -24, x: -4, y: 10, wing: 150, far: 0, spread: 0, legs: 0.74, lift: 0 },
    up: { rot: -34, x: 0, y: -6, wing: 28, far: 2, spread: 1, legs: 0.7, lift: 0 },
    down: { rot: -40, x: 0, y: 0, wing: 118, far: 102, spread: 1, legs: 0.6, lift: 0 },
    fly: { rot: -46, x: 0, y: -10, wing: 62, far: 44, spread: 1, legs: 0.35, lift: 0 },
    lie: { rot: 172, x: 6, y: -60, wing: 176, far: 0, spread: 0, legs: 1, lift: 0 },
  };
  const mix = (a, b, t) => {
    const o = {};
    for (const k in a) o[k] = a[k] + (b[k] - a[k]) * t;
    return o;
  };

  const rotPt = ([x, y], [cx, cy], deg) => {
    const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
    return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c];
  };
  // Resolve one pose into a set of polygons in box coordinates — the body axis is the hips, the wing axis is the shoulders
  const solve = (p) => {
    const body = (pt) => {
      const q = rotPt(pt, HIP, p.rot);
      return [q[0] + p.x, q[1] + p.y];
    };
    const legPt = ([x, y]) => body([HIP[0] + (x - HIP[0]), HIP[1] + (y - HIP[1]) * p.legs]);
    const sh = body(SHOULDER);
    const wingAt = (deg, scale) => wing.map(([x, y]) => {
      const q = rotPt([x * scale, y * scale], [0, 0], deg + p.rot);
      return [q[0] + sh[0], q[1] + sh[1]];
    });
    const folded = 0.82 + p.spread * 0.18;
    return {
      far: p.spread > 0.02 ? wingAt(p.far, 0.92) : null,
      torso: torso.map(body),
      wing: wingAt(p.wing, folded),
      eye: eye.map(body),
      lines: feathers.map((l) => l.map(body)),
      legs: legs.map((l) => l.map(legPt)).concat(toes.map((l) => l.map(legPt))),
    };
  };

  const pathD = (pts) => "M" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L") + "Z";
  const lineD = (pts) => "M" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L");

  // Still image — fill is currentColor, and the eye and feather lines are painted by CSS with --crow-detail
  const svg = (name, opts = {}) => {
    const p = typeof name === "string" ? poses[name] || poses.stand : name;
    const s = solve(p);
    const legs = s.legs.map((l) => `<path d="${lineD(l)}"/>`).join("");
    return `<svg class="crow" viewBox="-30 -50 150 200" aria-hidden="true" focusable="false"${opts.flip ? ' style="transform:scaleX(-1)"' : ""}>` +
      (s.far ? `<path class="crow__far" d="${pathD(s.far)}"/>` : "") +
      `<g class="crow__legs">${legs}</g>` +
      `<path class="crow__body" d="${pathD(s.torso)}"/>` +
      `<path class="crow__wing" d="${pathD(s.wing)}"/>` +
      `<g class="crow__lines">${s.lines.map((l) => `<path d="${lineD(l)}"/>`).join("")}</g>` +
      `<path class="crow__eye" d="${pathD(s.eye)}"/>` +
      `</svg>`;
  };

  // One canvas — stands in for the original frame sets (124 and 26 frames). The caller turns the frame number into a pose and passes it in
  const draw = (ctx, p, { x = 0, y = 0, scale = 1, fill, detail, far } = {}) => {
    const s = solve(p);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    const poly = (pts) => {
      ctx.beginPath();
      pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
      ctx.closePath();
    };
    if (s.far) {
      poly(s.far);
      ctx.fillStyle = far || fill;
      ctx.fill();
    }
    ctx.strokeStyle = fill;
    ctx.lineWidth = 3.2;
    ctx.lineCap = "round";
    s.legs.forEach((l) => {
      ctx.beginPath();
      ctx.moveTo(l[0][0], l[0][1]);
      ctx.lineTo(l[1][0], l[1][1]);
      ctx.stroke();
    });
    ctx.fillStyle = fill;
    poly(s.torso);
    ctx.fill();
    poly(s.wing);
    ctx.fill();
    ctx.strokeStyle = detail;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1;
    poly(s.wing);
    ctx.stroke();
    s.lines.forEach((l) => {
      ctx.beginPath();
      ctx.moveTo(l[0][0], l[0][1]);
      ctx.lineTo(l[1][0], l[1][1]);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = detail;
    poly(s.eye);
    ctx.fill();
    ctx.restore();
  };

  // One wingbeat cycle as 0..1 — swings between the up and down poses with a sine
  const flap = (t, base = poses.fly) => {
    const w = (Math.sin(t * Math.PI * 2) + 1) / 2;
    return mix(mix(poses.down, poses.up, w), base, 0.35);
  };

  // Reads a css color (including variables and oklch) as the value painted on screen — paint it on a 1px canvas and read the pixel, so any color syntax becomes rgb
  let probe = null;
  const rgb = (css) => {
    const el = document.createElement("i");
    el.style.cssText = "display:none;color:" + css;
    document.body.append(el);
    const c = getComputedStyle(el).color;
    el.remove();
    probe = probe || document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = c;
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  };
  const color = (css) => `rgb(${rgb(css).join(",")})`;
  // Lottie takes [r,g,b,1] in 0..1 — change the skin and it is baked again
  const rgba = (css) => rgb(css).map((v) => v / 255).concat(1);

  // Bakes one scene into the animationData that lottie-web reads — same as the original after-crash Lottie: 30fps, 337 frames, 1920×1080
  // timeline(frame) is {pose, x, y, scale} returns. Body, wings, legs and eyes are split into layers, and each layer gets keys at 2-frame intervals
  const lottie = (timeline, { fill, detail, far, pale, frames = 337, fps = 30, w = 1920, h = 1080 } = {}) => {
    const STEP = 2;
    const keysOf = (fn) => {
      const k = [];
      for (let t = 0; t < frames; t += STEP) k.push({ t, s: fn(t), i: { x: [1], y: [1] }, o: { x: [0], y: [0] } });
      k.push({ t: frames - 1, s: fn(frames - 1) });
      return { a: 1, k };
    };
    const shapeOf = (fn, color, closed = true, stroke = 0) => {
      const sample = fn(0);
      const animated = { a: 1, k: [] };
      for (let t = 0; t < frames; t += STEP) animated.k.push({ t, s: [vert(fn(t), closed)], i: { x: 1, y: 1 }, o: { x: 0, y: 0 } });
      animated.k.push({ t: frames - 1, s: [vert(fn(frames - 1), closed)] });
      // While fallen, a pale color, on standing up, the proper color — only body colors given pale get keyframes
      const tint = color === fill && pale
        ? keysOf((t) => { const q = timeline(t).pale || 0; return fill.map((v, i) => (i < 3 ? v + (pale[i] - v) * q : 1)); })
        : { a: 0, k: color };
      const paint = stroke
        ? { ty: "st", c: tint, o: { a: 0, k: 100 }, w: { a: 0, k: stroke }, lc: 2, lj: 2 }
        : { ty: "fl", c: tint, o: { a: 0, k: 100 }, r: 1 };
      return { ty: "gr", it: [{ ty: "sh", ks: sample ? animated : { a: 0, k: vert([[0, 0]], closed) } }, paint, tr()] };
    };
    const vert = (pts, c) => ({ i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]), v: pts.map((p) => [+p[0].toFixed(2), +p[1].toFixed(2)]), c });
    const tr = () => ({ ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } });
    const cache = new Map();
    const at = (t) => {
      if (!cache.has(t)) cache.set(t, solve(timeline(t).pose));
      return cache.get(t);
    };
    const hidden = [[0, 0], [0.01, 0], [0, 0.01]];
    const layer = (ind, nm, shapes) => ({
      ddd: 0, ind, ty: 4, nm, sr: 1, ao: 0, ip: 0, op: frames, st: 0, bm: 0,
      ks: {
        o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, a: { a: 0, k: [0, 0, 0] },
        p: { s: true, x: keysOf((t) => [timeline(t).x]), y: keysOf((t) => [timeline(t).y]) },
        s: keysOf((t) => { const v = timeline(t).scale * 100; return [v, v, 100]; }),
      },
      shapes,
    });
    return {
      v: "5.7.4", fr: fps, ip: 0, op: frames, w, h, nm: "crow", ddd: 0, assets: [],
      layers: [
        layer(1, "eye", [shapeOf((t) => at(t).eye, detail)]),
        layer(2, "wing", [shapeOf((t) => at(t).wing, fill)]),
        layer(3, "body", [shapeOf((t) => at(t).torso, fill)]),
        layer(4, "legs", at(0).legs.map((_, i) => shapeOf((t) => at(t).legs[i], fill, false, 3.2))),
        layer(5, "far", [shapeOf((t) => at(t).far || hidden, far || fill)]),
      ],
    };
  };

  // [data-crow="Posture"Put a still image in the ] slot — for slots that arrive late, the caller just calls fill() again
  const fill = (root = document) => {
    root.querySelectorAll("[data-crow]:not([data-crow-done])").forEach((el) => {
      el.innerHTML = svg(el.dataset.crow, { flip: el.hasAttribute("data-crow-flip") });
      el.setAttribute("data-crow-done", "");
    });
  };

  window.CFSCrow = { poses, mix, solve, svg, draw, flap, lottie, rgba, color, fill };
})();
