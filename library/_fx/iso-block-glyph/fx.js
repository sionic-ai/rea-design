// Isometric block letters — the original is a 500×500 · 60fps · 625-frame looping canvas exported from an animation tool to CreateJS.
// With the same library (CreateJS) and the same frame (frame-based Tween, cubicInOut/cubicOut/cubicIn) we redraw our cube letters and decorative shapes.
// The glyph shapes (GLYPHS) are placeholders — write the company’s two initials as block cells. Colors are read from --kf-accent (cube) and --fx-candy-a~e (decorative shapes).
(() => {
  const FPS = 60, SIZE = 500, EDGE = 36;
  const COS = Math.cos(Math.PI / 6);

  // Letter = Multiple strokes, stroke = In flow order, the [i (bottom-right axis), z (top)] cells. Like the original P, the cells flow one by one along the stroke
  const GLYPHS = {
    A: [
      [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6]],
      [[1, 6], [2, 6], [3, 6]],
      [[4, 6], [4, 5], [4, 4], [4, 3], [4, 2], [4, 1], [4, 0]],
      [[3, 3], [2, 3], [1, 3]],
    ],
    B: [
      [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6]],
      [[1, 6], [2, 6], [3, 6], [4, 5], [4, 4], [3, 3], [2, 3], [1, 3]],
      [[4, 2], [4, 1], [3, 0], [2, 0], [1, 0]],
    ],
  };

  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgbOf = (cssColor) => {
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = cssColor;
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  };
  const resolve = (name, fallback) => {
    const el = document.createElement("i");
    el.style.color = fallback ? `var(${name}, ${fallback})` : `var(${name})`;
    el.style.display = "none";
    document.body.append(el);
    const c = getComputedStyle(el).color;
    el.remove();
    return rgbOf(c);
  };
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const css = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;

  function palette() {
    const accent = resolve("--kf-accent"), white = resolve("--kf-surface"), ink = resolve("--kf-ink");
    return {
      top: css(mix(accent, white, 0.45)),
      left: css(mix(accent, white, 0.12)),
      right: css(mix(accent, ink, 0.28)),
      edge: css(mix(accent, white, 0.7)),
      objs: [["--fx-candy-a", 0.68, 0.17, -210], ["--fx-candy-b", 0.7, 0.19, 100], ["--fx-candy-c", 0.78, 0.2, -115], ["--fx-candy-d", 0.86, 0.16, -170], ["--fx-candy-e", 0.5, 0.2, 20]].map(([n, l, ch, dh]) => {
        const c = resolve(n, `oklch(from var(--kf-accent) ${l} ${ch} calc(h + ${dh}))`);
        return { base: css(c), dark: css(mix(c, ink, 0.3)), light: css(mix(c, white, 0.45)) };
      }),
    };
  }

  const iso = (i, z) => ({ x: i * EDGE * COS, y: i * EDGE * 0.5 - z * EDGE });

  function cube(pal) {
    const s = new createjs.Shape();
    const g = s.graphics, h = EDGE * COS, q = EDGE * 0.5;
    g.f(pal.top).mt(0, -EDGE).lt(h, -EDGE + q).lt(0, -EDGE + 2 * q).lt(-h, -EDGE + q).cp();
    g.f(pal.left).mt(-h, -EDGE + q).lt(0, 0).lt(0, EDGE).lt(-h, EDGE - q).cp();
    g.f(pal.right).mt(0, 0).lt(h, -EDGE + q).lt(h, EDGE - q).lt(0, EDGE).cp();
    g.s(pal.edge).ss(1).mt(-h, -EDGE + q).lt(0, 0).lt(h, -EDGE + q).mt(0, 0).lt(0, EDGE);
    return s;
  }

  // Per stroke the cells flow one cell every 59 frames (original instance move 59 frames), the first cell starts growing at frame 19 and the last cell shrinks to .6x as it leaves
  function glyph(letter, pal) {
    const box = new createjs.Container();
    const strokes = GLYPHS[letter] || GLYPHS.A;
    const cells = [];
    strokes.forEach((path) => {
      const n = path.length;
      for (let k = 0; k < n; k++) {
        const c = cube(pal);
        cells.push({ c, path, k, n });
        box.addChild(c);
      }
    });
    let w = 0, hgt = 0;
    strokes.flat().forEach(([i, z]) => { w = Math.max(w, i); hgt = Math.max(hgt, z); });
    const mid = iso(w / 2, hgt / 2);
    box.regX = mid.x; box.regY = mid.y;
    box.bw = w * EDGE * COS + 2 * EDGE * COS;
    box.bh = hgt * EDGE + w * EDGE * 0.5 + 2 * EDGE;
    let frame = 0;
    box.on("tick", () => {
      const t = (frame % 60) / 59;
      frame++;
      cells.forEach((cell) => {
        const { c, path, k, n } = cell;
        const a = path[k], b = path[Math.min(k + 1, n - 1)];
        const pa = iso(a[0], a[1]), pb = iso(b[0], b[1]);
        if (k === n - 1) {
          c.x = pa.x; c.y = pa.y; c.depth = a[0] + a[1];
          c.scaleX = c.scaleY = 1 - 0.4 * Math.min(1, t * 1.5);
          c.visible = t < 0.66;
          return;
        }
        c.x = pa.x + (pb.x - pa.x) * t;
        c.y = pa.y + (pb.y - pa.y) * t;
        c.depth = a[0] + a[1] + (b[0] + b[1] - a[0] - a[1]) * t;
        c.visible = true;
        c.scaleX = c.scaleY = 1;
        if (k === 0) {
          const grow = Math.max(0, (frame % 60 - 19) / 40);
          const g0 = iso(a[0], a[1]);
          cell.ghost = cell.ghost || (() => { const gc = cube(pal); box.addChildAt(gc, 0); return gc; })();
          cell.ghost.x = g0.x; cell.ghost.y = g0.y; cell.ghost.depth = a[0] + a[1] - 0.01;
          cell.ghost.scaleX = cell.ghost.scaleY = grow;
          cell.ghost.visible = grow > 0;
        }
      });
      box.sortChildren((p, q) => (p.depth - q.depth) || (p.x - q.x));
    });
    return box;
  }

  function candy(kind, col) {
    const s = new createjs.Shape(), g = s.graphics;
    if (kind === "ball") {
      g.rf([col.light, col.base, col.dark], [0, 0.55, 1], -6, -7, 2, 0, 0, 18).dc(0, 0, 18);
    } else if (kind === "ring") {
      g.s(col.base).ss(9).de(-17, -11, 34, 22);
      g.s(col.light).ss(3).a(0, -1, 14, Math.PI * 1.1, Math.PI * 1.7);
    } else if (kind === "cone") {
      g.f(col.base).mt(0, -24).lt(16, 14).lt(-2, 20).cp();
      g.f(col.dark).mt(0, -24).lt(-2, 20).lt(-15, 10).cp();
    } else if (kind === "pill") {
      g.lf([col.light, col.base, col.dark], [0, 0.5, 1], 0, -9, 0, 9).rr(-20, -9, 40, 18, 9);
    } else if (kind === "zig") {
      g.s(col.base).ss(7, "round", "round").mt(-18, 8).lt(-9, -8).lt(0, 8).lt(9, -8).lt(18, 8);
    } else {
      g.s(col.base).ss(9, "round").a(0, 0, 14, Math.PI * 0.3, Math.PI * 1.5);
    }
    return s;
  }

  const E = () => createjs.Ease;
  // Original values: P goes -6° → +6° over 99 frames cubicInOut, then +6° → -5.6° over 140 frames, then drops to -186° at .5x speed over 29 frames cubicIn.
  // N enters at frame 269 at .5x and 174° with a 30-frame cubicOut, swings ±6° twice for 120 frames each, then exits with a 30-frame cubicIn.
  // P re-enters at frame 570 over 54 frames with cubicOut and connects back to the start at frame 625.
  function letters(stage, pal, first, second, tweened) {
    const a = glyph(first, pal), b = glyph(second, pal);
    [a, b].forEach((g) => { g.x = 252; g.y = 254; stage.addChild(g); });
    a.rotation = -6; b.visible = false;
    tweened.push(a, b);
    const T = createjs.Tween;
    T.get(a, { loop: -1, useTicks: true })
      .to({ rotation: 6 }, 99, E().cubicInOut)
      .to({ rotation: -5.56 }, 140, E().sineInOut)
      .to({ rotation: -186, scaleX: 0.5, scaleY: 0.5 }, 29, E().cubicIn)
      .to({ visible: false }, 0)
      .wait(301)
      .to({ visible: true, rotation: 174, scaleX: 0.5, scaleY: 0.5 }, 0)
      .to({ rotation: -6, scaleX: 1, scaleY: 1 }, 54, E().cubicOut)
      .wait(2);
    T.get(b, { loop: -1, useTicks: true })
      .wait(269)
      .to({ visible: true, rotation: 174, scaleX: 0.5, scaleY: 0.5 }, 0)
      .to({ rotation: -6, scaleX: 1, scaleY: 1 }, 30, E().cubicOut)
      .to({ rotation: 6 }, 120, E().cubicInOut)
      .to({ rotation: -6 }, 120, E().cubicInOut)
      .to({ rotation: -186, scaleX: 0.5, scaleY: 0.5 }, 30, E().cubicIn)
      .to({ visible: false }, 0)
      .wait(56);
  }

  // Four orbiting: elliptical orbit, one lap in 320 frames, grows at the front (1.07×) and vanishes at the back (.46×). Five in place: rotate and bob back and forth over 90~120 frames cubicInOut.
  function orbit(stage, pal, tweened) {
    const kinds = ["ball", "pill", "cone", "zig"];
    const holder = new createjs.Container();
    holder.x = 250; holder.y = 250;
    stage.addChildAt(holder, 0);
    const front = new createjs.Container();
    front.x = 250; front.y = 250;
    stage.addChild(front);
    const items = kinds.map((k, i) => ({ s: candy(k, pal.objs[i % pal.objs.length]), off: i * 80 }));
    let f = 0;
    stage.on("tick", () => {
      f++;
      items.forEach(({ s, off }) => {
        const p = ((f + off) % 320) / 320;
        const ang = p * Math.PI * 2;
        const depth = Math.sin(ang);
        s.x = Math.cos(ang) * 222;
        s.y = 40 + depth * 52 - Math.cos(ang) * 10;
        const sc = 0.46 + (depth + 1) * 0.305;
        s.scaleX = s.scaleY = sc;
        s.rotation = 10 + depth * 15;
        s.alpha = depth < -0.55 ? Math.max(0, (depth + 0.85) / 0.3) : 1;
        (depth >= 0 ? front : holder).addChild(s);
      });
    });
    const spots = [
      { k: "ring", x: 436, y: 279, rot: -30, dy: 30, dur: 120 },
      { k: "ball", x: 246, y: 118, rot: 45, dy: -20, dur: 120 },
      { k: "cone", x: 185, y: 430, rot: -45, dy: 26, dur: 100 },
      { k: "zig", x: 58, y: 137, rot: 40, dy: 10, dur: 120, a: 0.8 },
      { k: "crescent", x: 400, y: 80, rot: -60, dy: 10, dur: 97 },
    ];
    spots.forEach((o, i) => {
      const s = candy(o.k, pal.objs[(i + 1) % pal.objs.length]);
      s.x = o.x; s.y = o.y; s.alpha = o.a || 1;
      stage.addChildAt(s, 0);
      tweened.push(s);
      createjs.Tween.get(s, { loop: -1, useTicks: true })
        .to({ rotation: o.rot, y: o.y + o.dy }, o.dur, E().cubicInOut)
        .to({ rotation: 0, y: o.y }, o.dur, E().cubicInOut);
    });
  }

  function fit(canvas) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    return Math.min(w, h) / SIZE;
  }

  // Spinning board: spins as soon as it is attached, and returns a detach function
  function play(canvas, opts) {
    const stage = new createjs.Stage(canvas);
    const root = new createjs.Container();
    stage.addChild(root);
    const pal = palette(), tweened = [];
    const host = { addChild: (c) => root.addChild(c), addChildAt: (c, i) => root.addChildAt(c, i), on: (e, fn) => root.on(e, fn) };
    letters(host, pal, opts.first, opts.second, tweened);
    orbit(host, pal, tweened);
    const resize = () => { const k = fit(canvas); root.scaleX = root.scaleY = k; root.x = (canvas.width - SIZE * k) / 2; root.y = (canvas.height - SIZE * k) / 2; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    createjs.Ticker.framerate = FPS;
    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
    createjs.Ticker.addEventListener("tick", stage);
    return () => {
      createjs.Ticker.removeEventListener("tick", stage);
      ro.disconnect();
      tweened.forEach((t) => createjs.Tween.removeTweens(t));
      stage.removeAllChildren(); stage.update();
    };
  }

  // A still frame (footer or decoration above text): the same letters as a frozen frame
  function still(canvas, opts) {
    const stage = new createjs.Stage(canvas);
    const g = glyph(opts.first, palette());
    stage.addChild(g);
    const draw = () => {
      fit(canvas);
      const k = Math.min(canvas.width / g.bw, canvas.height / g.bh) * opts.scale;
      g.x = canvas.width / 2; g.y = canvas.height / 2;
      g.scaleX = g.scaleY = k;
      g.rotation = opts.rotation;
      g.dispatchEvent("tick");
      stage.update();
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => { ro.disconnect(); stage.removeAllChildren(); stage.update(); };
  }

  kfFx.register("iso-block-glyph", (el, { options, reduce }) => {
    if (!window.createjs) return;
    let canvas = el.tagName === "CANVAS" ? el : el.querySelector("canvas");
    let made = null;
    if (!canvas) {
      made = canvas = document.createElement("canvas");
      made.style.cssText = "display:block;width:100%;height:100%";
      el.append(made);
    }
    const opts = {
      first: options.first || options.letter || "A", second: options.second || "B",
      scale: +(options.scale || 0.86), rotation: +(options.rotation ?? -6),
    };
    if (reduce || options.still === true || options.still === "true") {
      const off = still(canvas, opts);
      return () => { off(); made?.remove(); };
    }
    let stop = null;
    const start = () => { if (!stop) stop = play(canvas, opts); };
    // wait — starts running once this event reaches the element (the original turned the canvas on when the first letter of the title rose)
    const wait = options.wait;
    if (wait) el.addEventListener(wait, start, { once: true });
    else start();
    return () => { if (wait) el.removeEventListener(wait, start); stop?.(); made?.remove(); };
  });
})();
