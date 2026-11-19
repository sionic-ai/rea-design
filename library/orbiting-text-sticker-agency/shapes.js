// Cut-paper shape character — our shapes (200×200 SVG paths, a 286 board with margins placed on a 1000 board like the original) converted to Lottie data and run with lottie-web 5.13.0, same as the original. The original Lottie file is not used.
// Values measured from the original Lottie: 24fps, a hold key every 3 frames (8 stops per second, giving a jerky hand-animated feel), one loop 360f (15s) · 120f (5s).
// Our own motion per part, matched to the original width (1000 board → 200 board, so ÷5) and the number of direction changes. Pupils also jump 8 times per second without pausing, like the original.
// Playback follows the original Graphics part: plays only within about 200px of the screen, and with loopInterval rests 2~5 seconds after one loop then restarts.
(() => {
  // Fills are drawing content, so they are read from --site-c-* in shared.css (not skin)
  const PAL = ["sky", "green", "orange", "yellow", "violet", "violet2", "pink", "grey", "red", "cream", "bookred", "bookyellow", "line", "eye"];
  const read = (() => {
    let cache = null;
    return () => {
      if (cache) return cache;
      const probe = document.createElement("i");
      const cv = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
      document.body.append(probe);
      cache = {};
      for (const k of PAL) {
        probe.style.color = `var(--site-c-${k})`;
        cv.clearRect(0, 0, 1, 1);
        cv.fillStyle = getComputedStyle(probe).color;
        cv.fillRect(0, 0, 1, 1);
        const d = cv.getImageData(0, 0, 1, 1).data;
        cache[k] = [d[0] / 255, d[1] / 255, d[2] / 255, 1];
      }
      probe.remove();
      return cache;
    };
  })();

  // ── Drawing: parts from below. pivot is the axis for turning and scaling, anim is the motion (see motion below) ──
  const eye = (x, y, r, move) => [
    { shapes: [{ c: [x, y, r], paint: "eye" }], anim: move.white },
    { shapes: [{ c: [x + r * 0.15, y + r * 0.1, r * 0.5], paint: "line" }], anim: move.pupil },
  ];
  const CH = {
    blob: { op: 360, parts: [
      { shapes: [{ d: "M100 26c52-3 86 30 84 76-2 48-40 76-88 74-50-2-82-30-80-76 2-44 34-71 84-74Z", paint: "sky" }], pivot: [100, 176], anim: [{ k: "s", ax: 0.7, ay: 6.5, cyc: 2 }] },
      ...eye(78, 96, 13, { white: [{ k: "p", ax: 4, ay: 4.4, cyc: 3 }], pupil: [{ k: "p", ax: 3.8, ay: 9.7, cyc: 3 }] }),
      ...eye(128, 92, 13, { white: [{ k: "p", ax: 4, ay: 4.4, cyc: 3, ph: 0.2 }], pupil: [{ k: "p", ax: 3.8, ay: 9.7, cyc: 3 }] }),
    ] },
    penhand: { op: 360, parts: [
      { shapes: [{ d: "M150 14 168 24 82 168 66 174 68 156Z", paint: "red" }], pivot: [74, 166], anim: [{ k: "r", amp: 5, cyc: 3 }, { k: "p", ax: 1.2, ay: 0.1, cyc: 3 }] },
      { shapes: [
        { d: "M70 118c26-22 70-26 100-10 22 12 22 42-2 56-30 18-80 20-104 4-20-14-14-36 6-50Z", paint: "grey" },
        { d: "M92 132c18-8 34-10 50-8M86 146c22-6 44-6 62-2M96 160c16-2 30-2 42 0", pen: "line", w: 3 },
      ], pivot: [118, 140], anim: [{ k: "r", amp: 3, cyc: 12 }, { k: "p", ax: 1.9, ay: 1.5, cyc: 6 }] },
    ] },
    yhand: { op: 120, parts: [
      { shapes: [
        { d: "M40 150c-14-30-6-70 22-92 10-8 22-4 24 8l4-34c2-14 22-14 24 0l2 28 8-30c4-14 22-12 22 2l-4 36 14-22c8-12 24-4 18 10l-20 58c-10 34-36 52-66 50-22-2-40-10-48-14Z", paint: "yellow" },
        { d: "M90 64c-2 24 0 44 6 58M114 52c-4 26-4 48 2 66M136 62c-6 22-8 40-4 56", pen: "line", w: 3 },
      ], pivot: [62, 168], anim: [{ k: "r", amp: 4.9, cyc: 2 }, { k: "p", ax: 2.5, ay: 2.9, cyc: 1 }] },
    ] },
    trefoil: { op: 120, parts: [
      { shapes: [{ c: [66, 66, 42], paint: "violet" }], anim: [{ k: "p", ax: 5.1, ay: 5.5, cyc: 1 }] },
      { shapes: [{ c: [138, 96, 38], paint: "violet" }], anim: [{ k: "p", ax: 9.8, ay: 0.4, cyc: 1, ph: 0.33 }] },
      { shapes: [{ c: [82, 146, 44], paint: "violet" }], anim: [{ k: "p", ax: 1.5, ay: 5.1, cyc: 1, ph: 0.66 }] },
    ] },
    burst: { op: 120, parts: [
      { shapes: [{ d: "M100 20l14 38 34-26-8 42 44-6-34 30 40 22-44 8 22 38-40-18-6 44-24-36-28 32 2-44-42 12 28-34-40-20 44-6-24-38 40 16Z", paint: "pink" }], pivot: [100, 100], anim: [{ k: "s", ax: 20, ay: 20, cyc: 1 }, { k: "p", ax: 0, ay: 1.5, cyc: 1 }] },
    ] },
    figure: { op: 360, parts: [
      { shapes: [{ d: "M20 150c20-10 40-6 58-14 18-8 28-30 48-40 14-8 30-6 36 6 6 14-6 26-20 34-14 8-18 22-30 34-16 16-40 24-66 26-16 2-30-2-36-10Z", paint: "violet2" }], pivot: [96, 140], anim: [{ k: "r", amp: 5, cyc: 1.5 }, { k: "p", ax: 0, ay: 5.4, cyc: 1.5 }] },
      { shapes: [{ c: [156, 62, 18], paint: "violet2" }, { d: "M150 60h4M162 60h4", pen: "line", w: 2.5 }], pivot: [150, 82], anim: [{ k: "r", amp: 15, cyc: 1.5 }, { k: "p", ax: 0.9, ay: 0.4, cyc: 1.5 }] },
    ] },
    busts: { op: 360, parts: [
      { shapes: [{ c: [66, 74, 30], paint: "orange" }, { d: "M14 186c0-46 20-74 52-74s52 28 52 74Z", paint: "orange" }], pivot: [66, 186], anim: [{ k: "r", amp: 4.6, cyc: 1 }, { k: "p", ax: 0.7, ay: 1.2, cyc: 1 }] },
      { shapes: [{ c: [132, 86, 30], paint: "green" }, { d: "M82 192c0-46 20-72 50-72s52 26 52 72Z", paint: "green" }], pivot: [132, 192], anim: [{ k: "r", amp: 7.8, cyc: 2.5 }, { k: "p", ax: 0.6, ay: 0.4, cyc: 2.5 }] },
    ] },
    gblob: { op: 360, parts: [
      { shapes: [{ d: "M100 34c48-2 80 26 78 66-2 42-34 66-80 64-44-2-76-26-74-66 2-38 32-62 76-64Z", paint: "green" }], pivot: [100, 164], anim: [{ k: "s", ax: 0, ay: 5, cyc: 2 }] },
      ...eye(76, 104, 14, { white: [{ k: "p", ax: 0, ay: 4, cyc: 2 }], pupil: [{ k: "p", ax: 6.2, ay: 8.1, cyc: 4 }] }),
      ...eye(122, 108, 14, { white: [{ k: "p", ax: 0, ay: 4, cyc: 2 }], pupil: [{ k: "p", ax: 6.2, ay: 8.1, cyc: 4 }] }),
    ] },
    arrow: { op: 120, parts: [
      { shapes: [{ d: "M52 176c-10-50 2-96 52-110l-6-26 66 40-56 50-2-28c-28 8-34 36-26 74Z", paint: "red" }], pivot: [100, 104], anim: [{ k: "spin" }] },
    ] },
    book: { op: 120, parts: [
      { shapes: [
        { d: "M18 74 98 50l84 22-6 86-78-20-82 24Z", paint: "bookred" },
        { d: "M24 64 98 44l80 22-4 82-76-20-78 22Z", paint: "cream" },
        { d: "M98 44v94", pen: "eye", w: 3 },
        { d: "M138 56l12 4v30l-6-5-6 3Z", paint: "bookyellow" },
      ], pivot: [98, 140], anim: [{ k: "r", amp: 6, cyc: 1.5 }, { k: "p", ax: 0, ay: 7, cyc: 1 }] },
    ] },
    yman: { op: 360, parts: [
      { shapes: [{ d: "M70 92c18-10 40-8 54 4l24 36c4 8-4 14-10 8l-20-22-6 40 26 26c6 6 0 16-8 12l-34-26-24 26c-6 6-16 0-12-8l20-34 2-36-18 14c-6 6-14-2-10-8Z", paint: "orange" }], pivot: [96, 180], anim: [{ k: "r", amp: 7.8, cyc: 2.5 }, { k: "p", ax: 0.6, ay: 0.4, cyc: 2.5 }] },
      { shapes: [{ c: [102, 64, 20], paint: "orange" }], pivot: [102, 84], anim: [{ k: "r", amp: 3, cyc: 1.5 }] },
    ] },
    blacky: { op: 360, parts: [
      { shapes: [{ d: "M100 30c46-2 74 26 72 66-2 42-30 70-74 70-44 0-72-28-70-68 2-40 28-66 72-68Z", paint: "line" }], pivot: [100, 166], anim: [{ k: "s", ax: 0, ay: 5, cyc: 2 }] },
      { shapes: [{ c: [80, 102, 7], paint: "eye" }, { c: [118, 102, 7], paint: "eye" }], anim: [{ k: "p", ax: 3.4, ay: 20.2, cyc: 2 }] },
    ] },
  };

  // ── Motion: all with 3-frame hold keys ──
  const sine = (t, op, cyc = 1, ph = 0) => Math.sin(2 * Math.PI * (cyc * (t / op) + ph));
  const motion = (anim, op) => {
    const out = {};
    const frames = [];
    for (let t = 0; t < op; t += 3) frames.push(t);
    const val = (a, n, t) => {
      if (a.k === "r") return [(a.amp / 2) * sine(t, op, a.cyc, a.ph)];
      if (a.k === "spin") return [(360 * t) / op];
      if (a.k === "p") return [(a.ax / 2) * sine(t, op, a.cyc, a.ph), (a.ay / 2) * sine(t, op, a.cyc, (a.ph || 0) + 0.25)];
      if (a.k === "s") return [(a.ax / 2) * sine(t, op, a.cyc, a.ph), (a.ay / 2) * sine(t, op, a.cyc, a.ph)];
      return [0];
    };
    anim.forEach((a, n) => {
      const key = a.k === "spin" ? "r" : a.k;
      out[key] = out[key] || frames.map(() => (key === "r" ? [0] : [0, 0]));
      frames.forEach((t, i) => val(a, n, t).forEach((v, d) => (out[key][i][d] += v)));
    });
    return { frames, out };
  };

  // ── SVG path → Lottie bezier ──
  const pathToShapes = (d) => {
    const tok = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g);
    const subs = [];
    let i = 0, cmd = "", cur = [0, 0], start = [0, 0], lastC2 = null, sp = null;
    const num = () => +tok[i++];
    const vert = (p) => sp.push({ v: p, i: [0, 0], o: [0, 0] });
    while (i < tok.length) {
      if (/[a-zA-Z]/.test(tok[i])) cmd = tok[i++];
      const rel = cmd === cmd.toLowerCase();
      const C = cmd.toUpperCase();
      const at = (x, y) => (rel ? [cur[0] + x, cur[1] + y] : [x, y]);
      if (C === "M") {
        sp = [];
        subs.push({ pts: sp, closed: false });
        cur = at(num(), num());
        start = cur;
        vert(cur);
        cmd = rel ? "l" : "L";
        lastC2 = null;
      } else if (C === "L") { cur = at(num(), num()); vert(cur); lastC2 = null; }
      else if (C === "H") { cur = [rel ? cur[0] + num() : num(), cur[1]]; vert(cur); lastC2 = null; }
      else if (C === "V") { cur = [cur[0], rel ? cur[1] + num() : num()]; vert(cur); lastC2 = null; }
      else if (C === "C" || C === "S") {
        const c1 = C === "C" ? at(num(), num()) : lastC2 ? [2 * cur[0] - lastC2[0], 2 * cur[1] - lastC2[1]] : cur;
        const c2 = at(num(), num());
        const p = at(num(), num());
        const prev = sp[sp.length - 1];
        prev.o = [c1[0] - prev.v[0], c1[1] - prev.v[1]];
        sp.push({ v: p, i: [c2[0] - p[0], c2[1] - p[1]], o: [0, 0] });
        cur = p;
        lastC2 = c2;
      } else if (C === "Z") {
        subs[subs.length - 1].closed = true;
        const first = sp[0], last = sp[sp.length - 1];
        if (sp.length > 1 && Math.hypot(first.v[0] - last.v[0], first.v[1] - last.v[1]) < 0.01) {
          first.i = last.i;
          sp.pop();
        }
        cur = start;
        lastC2 = null;
      } else i++;
    }
    return subs.map(({ pts, closed }) => ({
      ty: "sh",
      ks: { a: 0, k: { c: closed, v: pts.map((p) => p.v), i: pts.map((p) => p.i), o: pts.map((p) => p.o) } },
    }));
  };

  const st = (v) => ({ a: 0, k: v });
  const anim = (frames, vals, base, dims) =>
    ({ a: 1, k: [...frames.map((t, i) => ({ t, s: dims(vals[i], base), h: 1 })), { t: frames.length * 3, s: dims(vals[0], base) }] });

  // The original Lottie has art only in the middle ~70% of a 1000 plate — we place our 200 plate art in the middle of a 286 plate to get the same margin
  // Boards use 1000 units like the original — our 286 board art is placed at K times scale (so one step of movement is the same unit as the original)
  const PAD = 43, K = 1000 / (200 + PAD * 2), SIZE = 1000;
  const toLottie = (name) => {
    const ch = CH[name];
    const pal = read();
    const layers = ch.parts.map((part, n) => {
      const pv = part.pivot || [100, 100];
      const items = part.shapes.map((s) => {
        const geo = s.c ? [{ ty: "el", p: st([s.c[0], s.c[1]]), s: st([s.c[2] * 2, s.c[2] * 2]), d: 1 }] : pathToShapes(s.d);
        const paint = s.pen
          ? { ty: "st", c: st(pal[s.pen]), o: st(100), w: st(s.w || 2), lc: 2, lj: 2 }
          : { ty: "fl", c: st(pal[s.paint]), o: st(100), r: 1 };
        return { ty: "gr", it: [...geo, paint, { ty: "tr", p: st([0, 0]), a: st([0, 0]), s: st([100, 100]), r: st(0), o: st(100), sk: st(0), sa: st(0) }] };
      }).reverse();
      const { frames, out } = motion(part.anim || [], ch.op);
      const ks = {
        o: st(100),
        a: st([pv[0], pv[1], 0]),
        r: out.r ? anim(frames, out.r, 0, (v, b) => [b + v[0]]) : st(0),
        p: out.p ? anim(frames, out.p, pv, (v, b) => [K * (PAD + b[0] + v[0]), K * (PAD + b[1] + v[1]), 0]) : st([K * (PAD + pv[0]), K * (PAD + pv[1]), 0]),
        s: out.s ? anim(frames, out.s, 100, (v, b) => [K * (b + v[0]), K * (b + v[1]), 100]) : st([K * 100, K * 100, 100]),
      };
      return { ddd: 0, ind: n + 1, ty: 4, nm: `${name}-${n}`, sr: 1, ks, ao: 0, shapes: items, ip: 0, op: ch.op, st: 0, bm: 0 };
    }).reverse();
    return { v: "5.13.0", fr: 24, ip: 0, op: ch.op, w: SIZE, h: SIZE, nm: name, ddd: 0, assets: [], layers };
  };

  // ── Attach ──
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((es) => es.forEach((e) => e.target.__chara?.view(e.isIntersecting)), { rootMargin: "200px" })
    : null;
  // opt: still (stops on first scene) · interval (rests 2~5s after one loop) · enabled (if false, doesn’t run until ID.enable)
  const mount = (el, name, opt = {}) => {
    if (!CH[name] || !window.lottie || el.__chara) return null;
    const a = lottie.loadAnimation({
      container: el, renderer: "svg", loop: !opt.interval, autoplay: false,
      animationData: toLottie(name), rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
    });
    let inView = false, enabled = opt.enabled !== false, wait = 0;
    const sync = () => {
      if (opt.still || reduced) return a.goToAndStop(0, true);
      if (enabled && inView) a.play();
      else { a.pause(); clearTimeout(wait); }
    };
    if (opt.interval) a.addEventListener("complete", () => {
      a.pause();
      wait = setTimeout(() => enabled && inView && a.goToAndPlay(0, true), (3 * Math.random() + 2) * 1000);
    });
    el.__chara = { anim: a, view: (v) => { inView = v; sync(); }, enable: () => { enabled = true; sync(); } };
    io ? io.observe(el) : el.__chara.view(true);
    sync();
    return el.__chara;
  };


  // ── Rolling in (original Graphics rollAnimation): once all are loaded, each steps up every .4s after its own delay — tilting alternately ±swing as it comes into place and growing from s0→s1.
  //    Step 0 is not visible yet, visible from step 1. data-roll="ox: -15; oy: -33; steps: 6; delay: 0; swing: 8; rot: -1; s0: .6"
  //    drag mode lets you drag with the mouse (the original is mouse-only). onRolled(n) is called for each character that stands as the nth
  const parse = (str) => Object.fromEntries((str || "").split(";").map((pair) => pair.split(":").map((x) => x.trim())).filter((p) => p[0]).map(([k, v]) => [k, +v]));
  const dragOff = (el, apply) => {
    const off = { x: 0, y: 0 };
    el.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const sx = e.clientX, sy = e.clientY, ox = off.x, oy = off.y;
      el.classList.add("is-drag");
      const move = (ev) => { off.x = ox + ev.clientX - sx; off.y = oy + ev.clientY - sy; apply(); };
      const up = () => { el.classList.remove("is-drag"); removeEventListener("mousemove", move); removeEventListener("mouseup", up); };
      addEventListener("mousemove", move);
      addEventListener("mouseup", up);
    });
    return off;
  };
  const rollIn = (els, { drag = false, interval = false, onRolled } = {}) => {
    const list = els.map((el) => {
      const r = parse(el.dataset.roll);
      const c = { el, step: -1, n: r.steps || 4, delay: r.delay || 0, rot: r.rot || 0, swing: r.swing ?? 15, s0: r.s0 ?? 1, s1: r.s1 ?? 1, ox: r.ox || 0, oy: r.oy || 0, off: { x: 0, y: 0 } };
      if (drag) c.off = dragOff(el, () => paint(c));
      return c;
    });
    const paint = (c) => {
      const mv = `translate(${c.off.x}px, ${c.off.y}px)`;
      if (c.step < 0) {
        c.el.style.transform = `translate(${-50 + c.ox}%, ${-50 + c.oy}%) rotate(${c.rot + c.swing}deg) scale(${c.s0}) ${mv}`;
        c.el.style.opacity = 0;
        return;
      }
      const i = c.step / c.n;
      const r = c.step >= c.n ? c.rot : c.step % 2 === 0 ? c.rot + c.swing : c.rot - c.swing;
      c.el.style.transform = `translate(${-50 + c.ox * (1 - i)}%, ${-50 + c.oy * (1 - i)}%) rotate(${r}deg) scale(${c.s0 + i * (c.s1 - c.s0)}) ${mv}`;
      c.el.style.opacity = c.step !== 0 ? 1 : 0;
    };
    list.forEach(paint);
    let rolled = 0;
    const enable = () => list.forEach((c) => c.el.__chara?.enable());
    if (reduced) {
      list.forEach((c) => { c.step = c.n; paint(c); mount(c.el, c.el.dataset.shape, { still: true }); });
      return { enable };
    }
    const go = (c) => setTimeout(() => {
      c.step = 0;
      paint(c);
      const iv = setInterval(() => {
        c.step++;
        paint(c);
        if (c.step >= c.n) { clearInterval(iv); onRolled?.(++rolled); }
      }, 400);
    }, c.delay * 1000);
    let loaded = 0;
    const ready = () => ++loaded === list.length && list.forEach(go);
    list.forEach((c) => {
      const ch = mount(c.el, c.el.dataset.shape, { interval, enabled: false });
      if (!ch) return ready();
      ch.anim.isLoaded ? ready() : ch.anim.addEventListener("DOMLoaded", ready);
    });
    return { enable };
  };

  const ID = (window.ID = window.ID || {});
  ID.mount = mount;
  ID.rollIn = rollIn;
  ID.dragOff = dragOff;
  ID.names = Object.keys(CH);
  ID.stickerNames = ["blob", "busts", "penhand", "trefoil", "book", "yhand", "burst", "gblob", "arrow", "figure"];
  const go = () => document.querySelectorAll("[data-shape]").forEach((el) => mount(el, el.dataset.shape, { still: el.hasAttribute("data-still"), interval: el.hasAttribute("data-interval"), enabled: !el.hasAttribute("data-wait") }));
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", go) : go();
})();
