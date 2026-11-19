(() => {
  // SVG inside the panel (data-fx-part="art") shapes and lines are baked into a single Lottie and looped endlessly from the start (default 5 seconds = 30fps, 150 frames).
  // The original is react-lottie, so pressing the board pauses it and pressing again resumes — that feel is carried over too.
  // Why the svg for the picture-substitute side is baked: the original Lottie JSON can’t be carried over, and as an svg the skin color (stroke, fill) follows through as is
  const K = 0.5523;

  const rgb = (css) => {
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255, 1];
  };

  // Reads only M·L·C·Q·H·V·Z (upper and lower case) — arcs (A) are written as C by the caller
  function parse(d) {
    const tok = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) || [];
    const subs = [];
    let cur = null, x = 0, y = 0, cmd = "", i = 0;
    const num = () => +tok[i++];
    const start = (px, py) => { cur = { v: [[px, py]], i: [[0, 0]], o: [[0, 0]], c: false }; subs.push(cur); };
    const line = (px, py) => { cur.v.push([px, py]); cur.i.push([0, 0]); cur.o.push([0, 0]); };
    while (i < tok.length) {
      if (/[a-zA-Z]/.test(tok[i])) cmd = tok[i++];
      const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
      const ox = rel ? x : 0, oy = rel ? y : 0;
      if (C === "Z") { if (cur) cur.c = true; continue; }
      if (C === "M") { x = ox + num(); y = oy + num(); start(x, y); cmd = rel ? "l" : "L"; continue; }
      if (!cur) start(x, y);
      if (C === "L") { x = ox + num(); y = oy + num(); line(x, y); }
      else if (C === "H") { x = ox + num(); line(x, y); }
      else if (C === "V") { y = oy + num(); line(x, y); }
      else if (C === "C" || C === "Q") {
        let x1 = ox + num(), y1 = oy + num(), x2, y2;
        if (C === "C") { x2 = ox + num(); y2 = oy + num(); }
        const nx = ox + num(), ny = oy + num();
        if (C === "Q") { x2 = nx + (2 / 3) * (x1 - nx); y2 = ny + (2 / 3) * (y1 - ny); x1 = x + (2 / 3) * (x1 - x); y1 = y + (2 / 3) * (y1 - y); }
        const last = cur.v.length - 1;
        cur.o[last] = [x1 - x, y1 - y];
        cur.v.push([nx, ny]); cur.i.push([x2 - nx, y2 - ny]); cur.o.push([0, 0]);
        x = nx; y = ny;
      } else i++;
    }
    return subs;
  }

  function subsOf(node) {
    const n = (a) => +node.getAttribute(a) || 0;
    const tag = node.tagName.toLowerCase();
    if (tag === "path") return parse(node.getAttribute("d") || "");
    if (tag === "line") return [{ v: [[n("x1"), n("y1")], [n("x2"), n("y2")]], i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]], c: false }];
    if (tag === "polyline" || tag === "polygon") {
      const p = (node.getAttribute("points") || "").trim().split(/[\s,]+/).map(Number), v = [];
      for (let k = 0; k + 1 < p.length; k += 2) v.push([p[k], p[k + 1]]);
      return v.length ? [{ v, i: v.map(() => [0, 0]), o: v.map(() => [0, 0]), c: tag === "polygon" }] : [];
    }
    if (tag === "circle" || tag === "ellipse") {
      const cx = n("cx"), cy = n("cy"), rx = n("rx") || n("r"), ry = n("ry") || n("r");
      return [{ v: [[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]], i: [[-rx * K, 0], [0, -ry * K], [rx * K, 0], [0, ry * K]], o: [[rx * K, 0], [0, ry * K], [-rx * K, 0], [0, -ry * K]], c: true }];
    }
    if (tag === "rect") {
      const x = n("x"), y = n("y"), w = n("width"), h = n("height");
      const v = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
      return [{ v, i: v.map(() => [0, 0]), o: v.map(() => [0, 0]), c: true }];
    }
    return [];
  }

  // Element → art root coordinate matrix. One head <g transform> Even when set down many times, it bends right back into place
  const toRoot = (node, root) => {
    let m = new DOMMatrix();
    for (let n = node; n && n !== root; n = n.parentNode) {
      const t = n.transform?.baseVal?.consolidate?.();
      if (t) { const q = t.matrix; m = new DOMMatrix([q.a, q.b, q.c, q.d, q.e, q.f]).multiply(m); }
    }
    return m;
  };
  const apply = (m, s, ox, oy) => ({
    c: s.c,
    v: s.v.map(([a, b]) => [m.a * a + m.c * b + m.e - ox, m.b * a + m.d * b + m.f - oy]),
    i: s.i.map(([a, b]) => [m.a * a + m.c * b, m.b * a + m.d * b]),
    o: s.o.map(([a, b]) => [m.a * a + m.c * b, m.b * a + m.d * b]),
  });

  const curve = (s, fb) => {
    const c = String(s || fb).split(",").map(Number);
    return c.length === 4 && c.every(Number.isFinite) ? c : fb.split(",").map(Number);
  };
  const st = (v) => ({ a: 0, k: v });
  // Several keys as one curve — [[frame, value], …]
  const keys = (pts, [ox, oy, ix, iy]) => ({
    a: 1,
    k: pts.map(([t, s], n) => (n < pts.length - 1 ? { t, s, o: { x: s.map(() => ox), y: s.map(() => oy) }, i: { x: s.map(() => ix), y: s.map(() => iy) } } : { t, s })),
  });
  const MARKS = "path, line, polyline, polygon, circle, ellipse, rect";

  kfFx.register("lottie-loop-scene", (el, { options, reduce }) => {
    const art = el.querySelector('[data-fx-part="art"]');
    const vb = art?.viewBox?.baseVal;
    if (!art || !vb || !vb.width || !vb.height) return;
    const sized = !el.style.aspectRatio && !el.style.height;
    if (sized) el.style.aspectRatio = `${vb.width} / ${vb.height}`;
    if (reduce || !window.lottie) return () => { if (sized) el.style.aspectRatio = ""; };

    const fr = +options.fps || 30;
    const total = Math.max(2, Math.round((+options.len || 5) * fr));
    const base = curve(options.ease, "0.333,0,0.667,1");
    const click = options.click !== "none";

    // Layer = Elements with data-kind (if g, all shapes inside it as one layer), and the other shapes grouped with their neighbors into one still layer.
    // Keep document order so the black-filled header covers the buildings and lines behind it
    const groups = [];
    const walk = (node) => {
      for (const c of node.children) {
        const tag = c.tagName.toLowerCase();
        if (tag === "defs" || tag === "title" || tag === "desc") continue;
        if (c.dataset.kind) groups.push({ node: c, kind: c.dataset.kind });
        else if (c.matches(MARKS)) {
          const last = groups[groups.length - 1];
          if (last && !last.node) last.list.push(c);
          else groups.push({ node: null, kind: "still", list: [c] });
        } else walk(c);
      }
    };
    walk(art);
    if (!groups.length) return () => { if (sized) el.style.aspectRatio = ""; };

    let anim = null;
    const build = () => {
      const layers = [];
      for (const g of groups) {
        const list = g.list || (g.node.matches(MARKS) ? [g.node] : [...g.node.querySelectorAll(MARKS)]);
        const d = g.node?.dataset || {};
        const t0 = Math.round(+(d.at ?? 0) * fr);
        const t1 = Math.min(total, t0 + Math.max(1, Math.round(+(d.dur ?? total / fr) * fr)));
        const ez = curve(d.ease, base.join(","));
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        const items = [];
        for (const m of list) {
          const cs = getComputedStyle(m);
          const mat = toRoot(m, art);
          const subs = subsOf(m).map((s) => apply(mat, s, vb.x, vb.y));
          if (!subs.length) continue;
          for (const s of subs) for (const [a, b] of s.v) { minX = Math.min(minX, a); maxX = Math.max(maxX, a); minY = Math.min(minY, b); maxY = Math.max(maxY, b); }
          const it = subs.map((s) => ({ ty: "sh", ks: st(s) }));
          const op = (+cs.opacity || 0) * 100;
          if (cs.fill !== "none") it.push({ ty: "fl", c: st(rgb(cs.fill)), o: st(op * (+cs.fillOpacity || 0)), r: 1 });
          if (cs.stroke !== "none") {
            const sw = (parseFloat(cs.strokeWidth) || 1) * Math.sqrt(Math.abs(mat.a * mat.d - mat.b * mat.c));
            it.push({ ty: "st", c: st(rgb(cs.stroke)), o: st(op * (+cs.strokeOpacity || 0)), w: st(sw), lc: 2, lj: 2, ml: 4 });
          }
          // Line sweep — the end (e) is drawn 0→100, then the start (s) follows 0→100 and erases it (original Trim Paths two keys)
          if (g.kind === "sweep" || m.dataset.sweep != null) {
            const at = Math.round(+(m.dataset.at ?? d.at ?? 0) * fr);
            const half = Math.max(1, Math.round(+(m.dataset.dur ?? d.dur ?? total / fr / 2) * fr));
            const mid = Math.min(total, at + half), end = Math.min(total, mid + half);
            it.push({ ty: "tm", m: 1, o: st(0), e: keys([[at, [0]], [mid, [100]]], ez), s: keys([[mid, [0]], [end, [100]]], ez) });
          }
          if (g.kind === "draw") it.push({ ty: "tm", m: 1, o: st(0), s: st(0), e: keys([[t0, [0]], [t1, [100]]], ez) });
          it.push({ ty: "tr", p: st([0, 0]), a: st([0, 0]), s: st([100, 100]), r: st(0), o: st(100), sk: st(0), sa: st(0) });
          items.push({ ty: "gr", it });
        }
        if (!items.length) continue;
        const [cx, cy] = d.origin ? d.origin.split(",").map(Number) : [(minX + maxX) / 2, (minY + maxY) / 2];
        const ks = { o: st(100), r: st(0), p: st([cx, cy, 0]), a: st([cx, cy, 0]), s: st([100, 100, 100]) };
        const to = d.to != null ? +d.to : null;
        const mid = Math.round((t0 + t1) / 2);
        if (g.kind === "pulse") { const s = to ?? 115; ks.s = keys([[t0, [100, 100, 100]], [mid, [s, s, 100]], [t1, [100, 100, 100]]], ez); }
        if (g.kind === "spin") ks.r = keys([[t0, [0]], [t1, [to ?? 360]]], d.ease ? ez : [0, 0, 1, 1]);
        if (g.kind === "sway") { const a = to ?? 8; ks.r = keys([[t0, [-a]], [mid, [a]], [t1, [-a]]], ez); }
        if (g.kind === "drift") {
          const [dx, dy] = (d.from || "0,-24").split(",").map(Number);
          ks.p = keys([[t0, [cx, cy, 0]], [mid, [cx + (dx || 0), cy + (dy || 0), 0]], [t1, [cx, cy, 0]]], ez);
        }
        if (g.kind === "blink") ks.o = keys([[t0, [100]], [mid, [to ?? 0]], [t1, [100]]], ez);
        if (g.kind === "ripple") {
          const s = to ?? 220;
          ks.s = keys([[t0, [0, 0, 100]], [t1, [s, s, 100]]], [0.2, 0.6, 0.4, 1]);
          ks.o = keys([[t0, [100]], [t1, [0]]], ez);
        }
        layers.push({ ddd: 0, ind: layers.length + 1, ty: 4, nm: g.kind, sr: 1, ks, ao: 0, shapes: items, ip: 0, op: total + 1, st: 0, bm: 0 });
      }
      if (!layers.length) return;
      anim?.destroy();
      art.style.display = "none";
      // Layers written first go on top — reversed to match svg order (later is on top)
      anim = lottie.loadAnimation({ container: el, renderer: "svg", loop: true, autoplay: true, animationData: { v: "5.7.4", fr, ip: 0, op: total, w: vb.width, h: vb.height, ddd: 0, assets: [], layers: layers.reverse() } });
    };

    // react-lottie’s handleClickToPause — click anywhere on the panel to pause, click again to resume from the same spot
    const toggle = () => { if (!anim) return; anim.isPaused ? anim.play() : anim.pause(); el.toggleAttribute("data-paused", anim.isPaused); };
    const key = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } };
    const addedRole = click && !el.hasAttribute("role");
    const addedTab = click && !el.hasAttribute("tabindex");
    if (click) {
      el.addEventListener("click", toggle);
      el.addEventListener("keydown", key);
      if (addedRole) { el.setAttribute("role", "button"); el.setAttribute("aria-label", el.getAttribute("aria-label") || "animation"); }
      if (addedTab) el.tabIndex = 0;
    }
    build();
    return () => {
      el.removeEventListener("click", toggle);
      el.removeEventListener("keydown", key);
      if (addedRole) { el.removeAttribute("role"); el.removeAttribute("aria-label"); }
      if (addedTab) el.removeAttribute("tabindex");
      el.removeAttribute("data-paused");
      anim?.destroy();
      art.style.display = "";
      if (sized) el.style.aspectRatio = "";
    };
  });
})();
