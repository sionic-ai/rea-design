(() => {
  // svg placed inside (data-fx-part="art") lines and dots baked into Lottie, once the board enters the screen by a set amount, each line is drawn with trim.
  // The original (a brand site design) revealed hand-drawn pictures with thick trim-line masks — the part draws the consumer’s own path directly instead of a picture
  const FR = 30;
  const K = 0.5523;

  const rgb = (css) => {
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255, 1];
  };

  // Reads only M·L·C·Q·H·V·Z (upper and lower case) — arcs (A) are rewritten as C
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
    // If a closed shape’s end point overlaps the start, merge them into one — trim hitches at overlapping points
    for (const s of subs) {
      const n = s.v.length - 1;
      if (s.c && n > 0 && Math.hypot(s.v[n][0] - s.v[0][0], s.v[n][1] - s.v[0][1]) < 0.01) { s.i[0] = s.i[n]; s.v.pop(); s.i.pop(); s.o.pop(); }
    }
    return subs;
  }

  function subsOf(node) {
    const n = (a) => +node.getAttribute(a) || 0;
    switch (node.tagName.toLowerCase()) {
      case "path": return parse(node.getAttribute("d") || "");
      case "line": return [{ v: [[n("x1"), n("y1")], [n("x2"), n("y2")]], i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]], c: false }];
      case "polyline":
      case "polygon": {
        const p = (node.getAttribute("points") || "").trim().split(/[\s,]+/).map(Number), v = [];
        for (let k = 0; k + 1 < p.length; k += 2) v.push([p[k], p[k + 1]]);
        return [{ v, i: v.map(() => [0, 0]), o: v.map(() => [0, 0]), c: node.tagName.toLowerCase() === "polygon" }];
      }
      case "circle":
      case "ellipse": {
        const cx = n("cx"), cy = n("cy"), rx = n("rx") || n("r"), ry = n("ry") || n("r");
        // Clockwise from 12 o’clock — the circle draws from the top
        return [{ v: [[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]], i: [[-rx * K, 0], [0, -ry * K], [rx * K, 0], [0, ry * K]], o: [[rx * K, 0], [0, ry * K], [-rx * K, 0], [0, -ry * K]], c: true }];
      }
      case "rect": {
        const x = n("x"), y = n("y"), w = n("width"), h = n("height");
        const v = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
        return [{ v, i: v.map(() => [0, 0]), o: v.map(() => [0, 0]), c: true }];
      }
      default: return [];
    }
  }

  const curve = (s, fb) => {
    const c = String(s || fb).split(",").map(Number);
    return c.length === 4 && c.every(Number.isFinite) ? c : fb.split(",").map(Number);
  };
  const st = (v) => ({ a: 0, k: v });
  const tr = (ax, ay) => ({ ty: "tr", p: st([ax, ay]), a: st([ax, ay]), s: st([100, 100]), r: st(0), o: st(100), sk: st(0), sa: st(0) });

  kfFx.register("lottie-path-draw", (el, { options, reduce }) => {
    const art = el.querySelector('[data-fx-part="art"]');
    const vb = art?.viewBox?.baseVal;
    if (!art || !vb || !vb.width || !vb.height) return;
    const marks = [...art.querySelectorAll("path, line, polyline, polygon, circle, ellipse, rect")];
    if (!marks.length || reduce || !window.lottie) return;

    const dur = +(options.dur ?? 2);
    const delay = +(options.delay ?? 0);
    const each = +(options.each ?? 0);
    const ease = curve(options.ease, "0.346,0.194,0.592,1");
    const at = +(options.at ?? 0.667);
    const gate = options.gate || "";
    let anim = null, played = false;

    const build = () => {
      const layers = [];
      let end = 1;
      marks.forEach((m, n) => {
        const cs = getComputedStyle(m);
        const kind = m.dataset.kind || (cs.fill !== "none" && cs.stroke === "none" ? "pop" : "draw");
        const t0 = Math.round((+(m.dataset.at ?? delay + n * each)) * FR);
        const len = +(m.dataset.dur ?? (kind === "pop" ? 5 / FR : dur));
        const t1 = t0 + Math.max(1, Math.round(len * FR));
        end = Math.max(end, t1);
        const [ox, oy, ix, iy] = curve(m.dataset.ease, kind === "pop" ? "0.212,-0.003,0,0.982" : ease.join(","));
        const subs = subsOf(m).map((s) => ({ ty: "sh", ks: st({ c: s.c, v: s.v.map(([a, b]) => [a - vb.x, b - vb.y]), i: s.i, o: s.o }) }));
        if (!subs.length) return;
        const it = [...subs];
        if (cs.fill !== "none") it.push({ ty: "fl", c: st(rgb(cs.fill)), o: st(100), r: 1 });
        if (cs.stroke !== "none") it.push({ ty: "st", c: st(rgb(cs.stroke)), o: st(100), w: st(parseFloat(cs.strokeWidth) || 1), lc: 2, lj: 2, ml: 4 });
        let ax = 0, ay = 0;
        if (kind === "draw") {
          it.push({ ty: "tm", m: m.dataset.trim === "seq" ? 2 : 1, s: st(0), o: st(0), e: { a: 1, k: [{ t: t0, s: [0], o: { x: [ox], y: [oy] }, i: { x: [ix], y: [iy] } }, { t: t1, s: [100] }] } });
        } else {
          const b = m.getBBox();
          ax = b.x + b.width / 2 - vb.x; ay = b.y + b.height / 2 - vb.y;
        }
        it.push(tr(0, 0));
        const ks = { o: st(100), r: st(0), p: st([ax, ay, 0]), a: st([ax, ay, 0]), s: st([100, 100, 100]) };
        if (kind === "pop") ks.s = { a: 1, k: [{ t: t0, s: [0, 0, 100], o: { x: [ox, ox, 0.333], y: [oy, oy, 0] }, i: { x: [ix, ix, 0.667], y: [iy, iy, 1] } }, { t: t1, s: [100, 100, 100] }] };
        if (kind === "fade") ks.o = { a: 1, k: [{ t: t0, s: [0], o: { x: [ox], y: [oy] }, i: { x: [ix], y: [iy] } }, { t: t1, s: [100] }] };
        if (kind === "slide") {
          const [dx, dy] = (m.dataset.from || "0,0").split(",").map(Number);
          ks.p = { a: 1, k: [{ t: t0, s: [ax + (dx || 0), ay + (dy || 0), 0], o: { x: ox, y: oy }, i: { x: ix, y: iy } }, { t: t1, s: [ax, ay, 0] }] };
          ks.o = { a: 1, k: [{ t: t0, s: [0], o: { x: [0.167], y: [0.167] }, i: { x: [0.833], y: [0.833] } }, { t: t0 + 2, s: [100] }] };
        }
        layers.push({ ddd: 0, ind: layers.length + 1, ty: 4, nm: kind, sr: 1, ks, ao: 0, shapes: [{ ty: "gr", it }], ip: 0, op: end + 1, st: 0, bm: 0 });
      });
      layers.forEach((l) => { l.op = end + 1; });
      anim?.destroy();
      art.style.display = "none";
      anim = lottie.loadAnimation({ container: el, renderer: "svg", loop: false, autoplay: false, animationData: { v: "5.6.6", fr: FR, ip: 0, op: end + 1, w: vb.width, h: vb.height, ddd: 0, assets: [], layers } });
      if (played) anim.goToAndStop(end, true);
    };

    // When height × at from the panel’s top edge has risen above the screen bottom — original scInCheck(⅔·⅓)·inview(0)
    const check = () => {
      if (played || !anim || (gate && !document.querySelector(gate))) return;
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) return;
      if (innerHeight >= r.top + r.height * at) play();
    };
    const play = () => {
      if (played || !anim) return;
      played = true;
      off();
      anim.goToAndStop(0, true);
      anim.play();
    };
    const off = () => { removeEventListener("scroll", check); removeEventListener("resize", check); };
    const onPlay = () => { played = false; play(); };

    const sized = !el.style.aspectRatio && !el.style.height;
    if (sized) el.style.aspectRatio = `${vb.width} / ${vb.height}`;
    build();
    if (options.when === "event") el.addEventListener("fx:play", onPlay);
    else {
      addEventListener("scroll", check, { passive: true });
      addEventListener("resize", check);
      requestAnimationFrame(check);
    }
    return () => {
      off();
      el.removeEventListener("fx:play", onPlay);
      anim?.destroy();
      art.style.display = "";
      if (sized) el.style.aspectRatio = "";
    };
  });
})();
