// Square-piece wordmark lens — each letter is stretched or shrunk in width by (its distance to the focus minus the average distance) × spread (narrowest .15x), and vertically bent around the focus height by the power 1/(1+bend).
// follow: cursor makes the focus chase the mouse by 1 − .88^dt of the remaining distance each frame (brand last screen), loop turns through four corners .7s each in a straight line (brand phone scene).
(() => {
  const warp = (fy, k) => {
    if (!k) return (v) => v;
    const n = 1 / (1 + k), r = Math.min(0.999, Math.max(0.001, fy));
    return (v) => (v <= r ? r * (v / r) ** n : r + (1 - r) * (1 - ((1 - v) / (1 - r)) ** n));
  };
  const CORNERS = [{ x: 0.98, y: 0.02 }, { x: 0.98, y: 0.98 }, { x: 0.02, y: 0.98 }, { x: 0.02, y: 0.02 }];

  kfFx.register("module-lens-word", (el, { options, reduce, hover }) => {
    const mods = [...el.querySelectorAll('[data-fx-part="module"]')];
    const rects = mods.map((m) => (m.dataset.rect || "").trim().split(/[\s,]+/).map(Number));
    if (!mods.length || rects.some((r) => r.length !== 4 || r.some(Number.isNaN))) return;
    const groups = new Map();
    mods.forEach((m, i) => {
      const key = m.dataset.letter ?? String(i);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(i);
    });
    const letters = [...groups.values()].map((idx) => ({ idx, left: Math.min(...idx.map((i) => rects[i][0])), right: Math.max(...idx.map((i) => rects[i][0] + rects[i][2])) })).sort((a, b) => a.left - b.left);
    const boxOpt = String(options.box || "").split(/[\s,]+/).map(Number).filter((v) => v > 0);
    const W = boxOpt[0] || Math.max(...rects.map((r) => r[0] + r[2])), H = boxOpt[1] || Math.max(...rects.map((r) => r[1] + r[3]));
    const spread = +(options.spread ?? 1.6), bend = +(options.bend ?? 1.4), each = +(options.each ?? 0.7) || 0.7, keep = +(options.lag ?? 0.88);
    let mode = options.follow || "cursor";
    if (mode === "cursor" && !hover) mode = "loop";
    const at = { x: +(options.x ?? 0.5), y: +(options.y ?? 0.5) }, want = { ...at };
    const draw = () => {
      const bw = el.clientWidth, bh = el.clientHeight;
      if (!bw || !bh) return;
      const dist = letters.map((l) => Math.hypot((l.left + l.right) / 2 / W - at.x, 0.5 - at.y));
      const avg = dist.reduce((a, b) => a + b, 0) / dist.length, k = (d) => Math.max(0.15, 1 + spread * (d - avg));
      const wide = letters.map((l, i) => (l.right - l.left) * k(dist[i]));
      const gaps = letters.map((l, i) => (i < letters.length - 1 ? (letters[i + 1].left - l.right) * k(dist[i]) : 0));
      const total = wide.reduce((a, b) => a + b, 0) + gaps.reduce((a, b) => a + b, 0) || 1;
      const yw = warp(at.y, bend);
      let x = 0;
      letters.forEach((l, i) => {
        const a = x, b = (x += (wide[i] / total) * bw), span = l.right - l.left || 1;
        x += (gaps[i] / total) * bw;
        l.idx.forEach((j) => {
          const [mx, my, mw, mh] = rects[j];
          const x0 = Math.round(a + ((mx - l.left) / span) * (b - a)), x1 = Math.round(a + ((mx + mw - l.left) / span) * (b - a));
          const y0 = Math.round(yw(my / H) * bh), y1 = Math.round(yw((my + mh) / H) * bh);
          const s = mods[j].style;
          s.left = `${x0}px`; s.top = `${y0}px`; s.width = `${x1 - x0}px`; s.height = `${y1 - y0}px`;
        });
      });
    };
    const ro = new ResizeObserver(draw);
    ro.observe(el);
    draw();
    if (reduce || mode === "none") return () => ro.disconnect();
    let tl = null, onMove = null;
    const follow = () => {
      const f = 1 - keep ** gsap.ticker.deltaRatio(), dx = want.x - at.x, dy = want.y - at.y;
      if (Math.abs(dx) < 5e-4 && Math.abs(dy) < 5e-4) return;
      at.x += dx * f; at.y += dy * f;
      draw();
    };
    if (mode === "loop") {
      Object.assign(at, { x: 0.02, y: 0.02 });
      tl = gsap.timeline({ repeat: -1, onUpdate: draw });
      CORNERS.forEach((p) => tl.to(at, { ...p, duration: each, ease: "none" }));
    } else {
      onMove = (e) => { const r = el.getBoundingClientRect(); want.x = (e.clientX - r.left) / (r.width || 1); want.y = (e.clientY - r.top) / (r.height || 1); };
      addEventListener("pointermove", onMove, { passive: true });
      gsap.ticker.add(follow);
    }
    return () => {
      ro.disconnect();
      tl?.kill();
      if (onMove) removeEventListener("pointermove", onMove);
      gsap.ticker.remove(follow);
    };
  });
})();
