// A sliding puzzle where shape tiles on a grid panel slide into the empty cell — Brand hero.
// On each step the empty neighbor slides in by one cell (horizontal) or two cells (vertical, 5x more frequent), advances three steps, then returns the same way and rests.
// On each step two shapes morph into different forms (if MorphSVG exists), and tiles within 100px of the cursor shrink down to .72x.
(() => {
  const SHAPES = {
    square: "M0,0 H100 V100 H0 Z",
    circle: "M50,0 C77.6,0 100,22.4 100,50 C100,77.6 77.6,100 50,100 C22.4,100 0,77.6 0,50 C0,22.4 22.4,0 50,0 Z",
    diamond: "M50,0 L100,50 L50,100 L0,50 Z",
    triTl: "M0,0 H100 L0,100 Z", triBr: "M100,0 V100 H0 Z",
    arch: "M0,100 V50 C0,22.4 22.4,0 50,0 C77.6,0 100,22.4 100,50 V100 Z",
    leaf: "M100,0 C44.8,0 0,44.8 0,100 C55.2,100 100,55.2 100,0 Z",
    quarter: "M0,0 H100 V45 C100,75 75,100 45,100 H0 Z",
    scoop: "M0,0 H100 V50 C72.4,50 50,72.4 50,100 H0 Z",
  };
  const WEIGHT = { square: 8, circle: 2 };
  const pick = (cur) => {
    const keys = Object.keys(SHAPES).filter((k) => k !== cur);
    let r = Math.random() * keys.reduce((a, k) => a + (WEIGHT[k] || 1), 0);
    for (const k of keys) { r -= WEIGHT[k] || 1; if (r < 0) return k; }
    return keys[keys.length - 1];
  };
  kfFx.register("tile-slide-puzzle", (el, { options, reduce, hover }) => {
    const cols = Math.max(1, Math.round(+options.cols || 11)), rows = Math.max(1, Math.round(+options.rows || 3));
    const step = +(options.dur ?? 0.5), hold = +(options.hold ?? 0.2), rest = +(options.rest ?? 0.8);
    const bias = +(options.bias ?? 5) || 5, morphN = Math.max(0, Math.round(+(options.morph ?? 2)));
    const shrink = +(options.shrink ?? 0.72), reach = +(options.reach ?? 100);
    const ease = kfFx.ease(options.ease || "0.45,0,0.55,1", "power2.inOut");
    const kids = [...el.querySelectorAll('[data-fx-part="tile"]')];
    if (!kids.length) return;
    const ns = "http://www.w3.org/2000/svg";
    const tiles = kids.map((t, i) => {
      const col = +t.dataset.col || (i % cols) + 1, row = +t.dataset.row || Math.floor(i / cols) + 1;
      let path = t.querySelector("path");
      if (!path && t.dataset.shape) {
        const svg = document.createElementNS(ns, "svg");
        svg.setAttribute("viewBox", "0 0 100 100"); svg.setAttribute("preserveAspectRatio", "none");
        path = document.createElementNS(ns, "path");
        path.setAttribute("d", SHAPES[t.dataset.shape] || SHAPES.square);
        svg.append(path); t.append(svg);
        t.dataset.fxTspMade = "1";
      }
      t.style.setProperty("--fx-col", col); t.style.setProperty("--fx-row", row);
      return { el: t, col0: col, row0: row, col, row, path, shape: t.dataset.shape || "square", d0: path?.getAttribute("d") };
    });
    const fixed = [...el.querySelectorAll('[data-fx-part="fixed"]')];
    fixed.forEach((f) => { f.style.setProperty("--fx-col", +f.dataset.col || 1); f.style.setProperty("--fx-row", +f.dataset.row || 1); });
    const blocked = new Set(fixed.map((f) => `${f.dataset.col}:${f.dataset.row}`));
    el.style.setProperty("--fx-cols", cols); el.style.setProperty("--fx-rows", rows);
    if (reduce) return () => tiles.forEach((t) => t.el.dataset.fxTspMade && t.el.querySelector("svg")?.remove());
    const key = (c, r) => c + ":" + r;
    const plan = () => {
      tiles.forEach((t) => { t.col = t.col0; t.row = t.row0; });
      const occ = new Map(tiles.map((t, i) => [key(t.col, t.row), i]));
      const out = [];
      for (let s = 0; s < 3; s++) {
        const used = new Set(), moves = [], empties = [];
        for (let r = 1; r <= rows; r++) for (let c = 1; c <= cols; c++) if (!occ.has(key(c, r)) && !blocked.has(key(c, r))) empties.push([c, r]);
        gsap.utils.shuffle(empties).forEach(([c, r]) => {
          const opts = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => occ.has(key(c + dx, r + dy)) && !used.has(key(c + dx, r + dy)));
          if (!opts.length) return;
          let w = Math.random() * opts.reduce((a, o) => a + (o[1] ? bias : 1), 0), d = opts[0];
          for (const o of opts) { w -= o[1] ? bias : 1; if (w < 0) { d = o; break; } }
          let x = c + d[0], y = r + d[1], tc = c, tr = r, g = 0;
          while (g < (d[1] ? 2 : 1) && occ.has(key(x, y)) && !used.has(key(x, y))) {
            moves.push({ idx: occ.get(key(x, y)), col: tc, row: tr });
            used.add(key(x, y)); used.add(key(tc, tr));
            tc = x; tr = y; x += d[0]; y += d[1]; g++;
          }
        });
        moves.forEach((m) => occ.delete(key(tiles[m.idx].col, tiles[m.idx].row)));
        moves.forEach((m) => { const t = tiles[m.idx]; t.col = m.col; t.row = m.row; occ.set(key(t.col, t.row), m.idx); });
        out.push(tiles.map((t) => [t.col, t.row]));
      }
      return [...out, out[1], out[0], tiles.map((t) => [t.col0, t.row0])];
    };
    const morph = () => {
      if (!window.MorphSVGPlugin || !morphN) return;
      const pool = tiles.filter((t) => t.path);
      for (let k = 0; k < morphN && pool.length; k++) {
        const t = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
        t.shape = pick(t.shape);
        gsap.to(t.path, { morphSVG: SHAPES[t.shape], duration: step, ease, overwrite: "auto" });
      }
    };
    const seq = plan();
    const tl = gsap.timeline({ repeat: -1, paused: true });
    let at = 0;
    seq.forEach((pos, si) => {
      tiles.forEach((t, i) => tl.to(t.el, { "--fx-col": pos[i][0], "--fx-row": pos[i][1], duration: step, ease }, at));
      tl.call(morph, null, at);
      tl.call(() => el.dispatchEvent(new CustomEvent("fx:tile-step", { bubbles: true })), null, at);
      at += step + (si === seq.length - 1 ? rest : hold);
    });
    tl.set({}, {}, at);
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause()));
    io.observe(el);
    let mx = -9999, my = -9999, on = false, tick = null;
    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    if (hover && shrink !== 1) {
      const qs = tiles.map((t) => ({ t, x: gsap.quickTo(t.el, "--fx-s", { duration: 0.4, ease: "power3.out" }) }));
      addEventListener("pointermove", onMove, { passive: true });
      tick = () => {
        const b = el.getBoundingClientRect();
        if (!(mx >= b.left - reach && mx <= b.right + reach && my >= b.top - reach && my <= b.bottom + reach)) { if (on) { qs.forEach((q) => q.x(1)); on = false; } return; }
        on = true;
        for (const q of qs) {
          const r = q.t.el.getBoundingClientRect();
          const d = Math.hypot(r.left + r.width / 2 - mx, r.top + r.height / 2 - my);
          q.x(gsap.utils.clamp(shrink, 1, gsap.utils.mapRange(0, reach, shrink, 1, d)));
        }
      };
      gsap.ticker.add(tick);
    }
    return () => {
      tl.kill(); io.disconnect();
      if (tick) gsap.ticker.remove(tick);
      removeEventListener("pointermove", onMove);
      tiles.forEach((t) => {
        gsap.killTweensOf(t.path);
        t.el.style.removeProperty("--fx-col"); t.el.style.removeProperty("--fx-row"); t.el.style.removeProperty("--fx-s");
        if (t.el.dataset.fxTspMade) { t.el.querySelector("svg")?.remove(); delete t.el.dataset.fxTspMade; }
        else if (t.path && t.d0) t.path.setAttribute("d", t.d0);
      });
    };
  });
})();
