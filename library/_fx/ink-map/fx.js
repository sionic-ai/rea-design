// Hand-drawn map panel — dragging draws ink coastlines, trees, mountains, houses and dotted paths. Original paper.js tool values moved to SVG.
// Tools and options are re-read from data-fx-ink-map on every press: the tool bar only needs to change the tool in that attribute.
(() => {
  kfFx.register("ink-map", (el, { reduce }) => {
    const ac = new AbortController(), on = { signal: ac.signal };
    const NS = "http://www.w3.org/2000/svg", R = Math.random;
    const mk = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent?.append(e); return e; };
    const n1 = (v) => Math.round(v * 10) / 10, P = (p) => `${n1(p.x)},${n1(p.y)}`;
    const opt = (k, d) => {
      for (const part of (el.getAttribute("data-fx-ink-map") || "").split(";")) { const i = part.indexOf(":"); if (i > 0 && part.slice(0, i).trim() === k) return part.slice(i + 1).trim(); }
      return d;
    };
    const svg = mk("svg", { class: "fx-map" }, el);
    // Layer order (bottom→top): ground · road · mountain · tree · building. Within the same layer, the lower one (larger y) comes in front
    const layer = Object.fromEntries(["land", "roads", "mountains", "trees", "buildings"].map((n) => [n, mk("g", {}, svg)]));

    // 2D gradient noise — warp the coordinates slightly so it never hits 0 at grid points (stands in for the original simplex)
    const noise2 = (() => {
      const perm = [...Array(256).keys()];
      for (let i = 255; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
      const p = new Uint8Array(512).map((_, i) => perm[i & 255]);
      const G = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
      const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10), lerp = (a, b, t) => a + (b - a) * t;
      return (x, y) => {
        x += 0.318; y += 0.627;
        const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
        x -= Math.floor(x); y -= Math.floor(y);
        const g = (h, dx, dy) => G[h & 7][0] * dx + G[h & 7][1] * dy;
        const a = p[X] + Y, b = p[X + 1] + Y, u = fade(x), v = fade(y);
        return Math.max(-1, Math.min(1, 1.6 * lerp(lerp(g(p[a], x, y), g(p[b], x - 1, y), u), lerp(g(p[a + 1], x, y - 1), g(p[b + 1], x - 1, y - 1), u), v)));
      };
    })();
    const lineD = (pts, closed) => (pts.length ? "M" + pts.map(P).join("L") + (closed ? "Z" : "") : "");
    const smoothD = (pts, closed) => {
      const n = pts.length;
      if (n < 3) return lineD(pts, closed);
      const at = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
      let d = `M${P(pts[0])}`;
      for (let i = 0; i < (closed ? n : n - 1); i++) {
        const a = at(i - 1), b = at(i), c = at(i + 1), e = at(i + 2);
        d += `C${P({ x: b.x + (c.x - a.x) / 6, y: b.y + (c.y - a.y) / 6 })} ${P({ x: c.x - (e.x - b.x) / 6, y: c.y - (e.y - b.y) / 6 })} ${P(c)}`;
      }
      return d + (closed ? "Z" : "");
    };
    const simplify = (pts, tol = 2.5) => {
      if (pts.length < 3) return pts;
      const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
      const st = [[0, pts.length - 1]];
      while (st.length) {
        const [s, e] = st.pop(); let best = 0, idx = -1;
        const A = pts[s], B = pts[e], L = Math.hypot(B.x - A.x, B.y - A.y) || 1;
        for (let i = s + 1; i < e; i++) { const d = Math.abs((B.x - A.x) * (A.y - pts[i].y) - (A.x - pts[i].x) * (B.y - A.y)) / L; if (d > best) { best = d; idx = i; } }
        if (best > tol) { keep[idx] = 1; st.push([s, idx], [idx, e]); }
      }
      return pts.filter((_, i) => keep[i]);
    };

    const place = (lay, g, sortY) => {
      g.dataset.sortY = sortY;
      let next = null;
      for (const c of lay.children) { const y = +c.dataset.sortY; if (c !== g && y > sortY && (!next || y < +next.dataset.sortY)) next = c; }
      next ? lay.insertBefore(g, next) : lay.append(g);
    };
    // One symbol = Outer g that settles into place + inner g that bounces larger (anchored at the base)
    const item = (lay, sortY) => {
      const outer = mk("g"), inner = mk("g", {}, outer);
      sortY === undefined ? layer[lay].append(outer) : place(layer[lay], outer, sortY);
      return { outer, inner };
    };
    const pop = (inner, dur, ease) => !reduce && gsap.fromTo(inner, { scale: 0.5 }, { scale: 1, duration: dur, ease, transformOrigin: "50% 100%" });

    // ── Ground: a coastline whose thickness wobbles with noise + an echo line 15px to the right of travel. New points follow the previous point’s spot over 0.4s
    const live = new Set();
    const paint = () => live.forEach((c) => {
      c.main.el.setAttribute("d", c.done ? smoothD(c.main.pts, c.closed) : lineD(c.main.pts));
      c.echo.el.setAttribute("d", c.done ? smoothD(c.echo.pts, c.closed) : lineD(c.echo.pts));
      if (c.done && c.moving === 0) live.delete(c);
    });
    gsap.ticker.add(paint);
    const follow = (c, path, t) => {
      if (!path.pts.length || reduce) return path.pts.push({ ...t });
      const last = path.pts[path.pts.length - 1], p = { x: last.x, y: last.y };
      path.pts.push(p); c.moving++;
      gsap.to(p, { x: t.x, y: t.y, duration: 0.4, ease: "power2.out", onComplete: () => c.moving-- });
    };
    const coast = {
      min: 7, max: 45, cur: null,
      down(e) {
        const { inner } = item("land");
        const echo = mk("path", { class: "fx-echo" }, inner), main = mk("path", { class: "fx-land" }, inner);
        this.cur = { main: { el: main, pts: [{ ...e.point }] }, echo: { el: echo, pts: [] }, done: false, closed: false, moving: 0 };
        live.add(this.cur);
      },
      drag(e) {
        const c = this.cur, len = Math.hypot(e.delta.x, e.delta.y) || 1, nx = -e.delta.y / len, ny = e.delta.x / len;
        const r = noise2(e.point.x * 0.5, e.point.y * 0.5);
        follow(c, c.main, { x: e.point.x + nx * r * 5, y: e.point.y + ny * r * 5 });
        follow(c, c.echo, { x: e.point.x + nx * (15 + r * 2), y: e.point.y + ny * (15 + r * 2) });
      },
      up() { Object.assign(this.cur, { done: true, closed: opt("closed", "true") !== "false" }); live.add(this.cur); this.cur = null; },
    };

    // ── Trees: five trees each within radius 10 along the path, scattered at least radius×1.2 apart from each other. 0.5→1 elastic 0.8s
    const tree = {
      min: 20, max: 45,
      down(e) { this.scatter(e.point, 5, 1); },
      drag(e) { this.scatter(e.point); },
      scatter(at, radius = 10, count = 5) {
        const pointy = opt("round", "false") === "false", gap = radius * 1.2, made = [];
        const old = [...layer.trees.children].map((g) => ({ x: +g.dataset.tx, y: +g.dataset.ty }));
        for (let tries = 0; made.length < count && tries < count * 10; tries++) {
          const a = R() * Math.PI * 2, d = Math.sqrt(R()) * radius, c = { x: at.x + d * Math.cos(a), y: at.y + d * Math.sin(a) };
          const near = (q) => Math.hypot(c.x - q.x, c.y - q.y) < gap;
          if (old.some(near) || made.some(near)) continue;
          const k = (noise2(c.x, c.y) + 1) / 2, f = 4 + k * 2, s = (pointy ? 1.5 : 1) + k * 0.8, t = f * s;
          const { outer, inner } = item("trees", c.y);
          outer.dataset.tx = n1(c.x); outer.dataset.ty = n1(c.y);
          let crown;
          if (pointy) {
            const w = (R() - 0.5) * 1.5, o = f * 0.5, j = () => (R() - 0.5) * 0.15;
            const top = { x: c.x + w, y: c.y - t }, rt = { x: c.x + f + w * 0.7, y: c.y + t * (0.6 + j()) };
            const bot = { x: c.x, y: c.y + t * (1 + j()) }, lf = { x: c.x - f - w * 0.7, y: c.y + t * (0.6 + j()) };
            crown = `M${P(top)}C${P({ x: top.x + o, y: top.y + o })} ${P(rt)} ${P(rt)}Q${P({ x: c.x + f * 0.6 + w * 0.5, y: c.y + t })} ${P(bot)}Q${P({ x: c.x - f * 0.6 - w * 0.5, y: c.y + t })} ${P(lf)}C${P(lf)} ${P({ x: top.x - o, y: top.y + o })} ${P(top)}Z`;
          } else {
            const ry = f * s, kx = 0.552 * f, ky = 0.552 * ry, b1 = 1 + R() * 1.5, b3 = 1 + R() * 2;
            const rp = { x: c.x + f + R() * 2 - 1, y: c.y + R() * 2 - 1 };
            crown = `M${P({ x: c.x, y: c.y - ry })}C${P({ x: c.x + kx, y: c.y - ry })} ${P({ x: rp.x, y: rp.y - ky * b1 })} ${P(rp)}C${P({ x: rp.x, y: rp.y + ky * b1 })} ${P({ x: c.x + kx, y: c.y + ry })} ${P({ x: c.x, y: c.y + ry })}C${P({ x: c.x - kx, y: c.y + ry })} ${P({ x: c.x - f, y: c.y + ky * b3 })} ${P({ x: c.x - f, y: c.y })}C${P({ x: c.x - f, y: c.y - ky * b3 })} ${P({ x: c.x - kx, y: c.y - ry })} ${P({ x: c.x, y: c.y - ry })}Z`;
          }
          mk("path", { class: "fx-crown", d: crown }, inner);
          mk("path", { class: "fx-trunk", d: `M${n1(c.x)},${n1(c.y + t - 1)}L${n1(c.x)},${n1(c.y + t + 4)}` }, inner);
          made.push(c);
          pop(inner, 0.8, "elastic.out");
        }
      },
    };

    // ── Mountains: peaks stamped at 40~65 spacing by size (small .7 · medium 1 · large 1.4), rising with back.out(4) 0.4s
    const SIZE = { sm: 0.7, md: 1, lg: 1.4 };
    const k = () => SIZE[opt("size", "md")] || 1;
    const mountain = {
      get min() { return 40 * k(); },
      get max() { return 65 * k(); },
      down(e) { this.peak(e.point); },
      drag(e) { this.peak(e.point); },
      peak(at) {
        const s = k(), w = (50 + R() * 20) * s, h = (40 + R() * 20) * s, seed = R() * 1000;
        const L = at.x - w / 2, base = at.y, top = base - h, pts = [{ x: L, y: base }];
        for (let i = 1; i <= 3; i++) { const t = i / 4, j = noise2(seed + i * 0.8, seed + i * 1.7); pts.push({ x: L + (w / 2) * t + j * 4, y: base - h * t + j * 4 }); }
        pts.push({ x: at.x, y: top });
        for (let i = 3; i >= 1; i--) { const t = i / 4, j = noise2(seed + i * 0.8, seed + i * 1.7); pts.push({ x: at.x + (w / 2) * (1 - t) + j * 4, y: base - h * t + j * 4 }); }
        pts.push({ x: at.x + w / 2, y: base });
        const { inner } = item("mountains", base);
        mk("path", { class: "fx-mt", d: lineD(pts) }, inner);
        const steps = opt("size", "md") === "sm" ? 1 : 3, end = { x: at.x + (noise2(seed + 30, seed) * w) / 6, y: base - h * 0.25 }, ridge = [{ x: at.x, y: top }];
        for (let i = 1; i <= steps; i++) { const t = i / (steps + 1), j = noise2(seed + i * 1.4, seed + i * 0.9); ridge.push({ x: at.x + (end.x - at.x) * t + j * 5, y: top + (end.y - top) * t + j * 3 }); }
        ridge.push(end);
        mk("path", { class: "fx-ridge", d: smoothD(ridge, false) }, inner);
        pop(inner, 0.4, "back.out(4)");
      },
    };

    // ── Path: dotted line and endpoints. Within 15px of an endpoint it snaps on to that point, and on release it is simplified and smoothed
    const route = {
      min: 5, max: 15, cur: null,
      near(p) { return [...layer.roads.querySelectorAll(".fx-end")].find((c) => Math.hypot(+c.getAttribute("cx") - p.x, +c.getAttribute("cy") - p.y) <= 15); },
      end(g, p) { return mk("circle", { class: "fx-end", cx: n1(p.x), cy: n1(p.y), r: 3 }, g); },
      down(e) {
        const hit = this.near(e.point), p = hit ? { x: +hit.getAttribute("cx"), y: +hit.getAttribute("cy") } : e.point;
        const { inner } = item("roads"), path = mk("path", { class: "fx-road" }, inner);
        if (!hit) this.end(inner, p);
        this.cur = { inner, path, pts: [{ ...p }] };
      },
      drag(e) { this.cur.pts.push({ ...e.point }); this.cur.path.setAttribute("d", lineD(this.cur.pts)); },
      up(e) {
        const c = this.cur; if (!c) return;
        const hit = this.near(e.point), p = hit && !c.inner.contains(hit) ? { x: +hit.getAttribute("cx"), y: +hit.getAttribute("cy") } : e.point;
        c.pts[c.pts.length - 1] = { ...p };
        if (!hit || c.inner.contains(hit)) this.end(c.inner, p);
        c.path.setAttribute("d", smoothD(simplify(c.pts), false));
        this.cur = null;
      },
    };

    // ── Buildings: a castle, house or tower at the pressed spot. 0.5→1 bounce.out 0.4s
    const shape = (g, d, cls = "fx-bld") => mk("path", { class: cls, d }, g);
    const win = (g, x, y) => mk("rect", { class: "fx-hole", x: n1(x), y: n1(y - 5), width: 3, height: 5 }, g);
    const door = (g, b, n = 7, r = 10) => {
      const x = (b.left + b.right) / 2 - n / 2, s = b.bottom - r + n / 2;
      shape(g, `M${n1(x)},${n1(b.bottom)}L${n1(x)},${n1(s)}A${n / 2},${n / 2} 0 0 1 ${n1(x + n)},${n1(s)}L${n1(x + n)},${n1(b.bottom)}Z`, "fx-hole");
    };
    const ground = (g, b, kind) => mk("path", { class: "fx-ground", d: `M${n1(b.left - (kind === "house" ? 6 : 5))},${n1(b.bottom)}L${n1(b.right + (kind === "house" ? 22 : 5))},${n1(b.bottom)}` }, g);
    const flag = (g, b) => { const t = (b.left + b.right) / 2, n = b.top + 5; shape(g, `M${n1(t)},${n1(n)}L${n1(t)},${n1(n - 20)}L${n1(t + 10)},${n1(n - 16)}L${n1(t)},${n1(n - 12)}`); };
    const windows = (g, b, kind, both = true) => {
      const tw = kind === "tower", spread = tw ? 20 : 5, i = b.bottom - b.h / (tw ? 2.5 : 1.8);
      const a = b.h > 40 ? i - R() * spread : i, o = b.h > 40 ? i - R() * spread : i;
      const s = b.left + b.w * 0.2, c = b.left + b.w * 0.8 - 3, l = Math.floor(R() * 3);
      if (l === 0) win(g, s, kind === "house" ? i + 5 : i);
      else if (l === 1) win(g, c, o);
      else if (both) { win(g, s, a); win(g, c, o); }
    };
    const block = (g, at, tall, tower) => {
      let w = tall ? 10 + R() * 5 : 20 + R() * 10, h = tall ? 25 + R() * 10 : 15 + R() * 10;
      if (tower) { w = 15 + R() * 5; h = 30 + R() * 10; }
      const b = { left: at.x - w / 2, right: at.x + w / 2, top: at.y - h, bottom: at.y, w, h };
      const o = Math.max(1, Math.floor(w / 5)), span = w + (tower ? 6 : 0), gap = o > 1 ? (span - o * 5) / (o - 1) : 0;
      const u = b.top - 4, d0 = at.x - span / 2, xs = Array.from({ length: o }, (_, q) => d0 + q * (5 + gap));
      if (tower) {
        shape(g, `M${n1(b.left)},${n1(b.bottom)}V${n1(b.top)}H${n1(b.right)}V${n1(b.bottom)}Z`);
        let d = `M${n1(d0)},${n1(u + 9)}V${n1(u + 4)}`;
        xs.forEach((x) => (d += `H${n1(x)}V${n1(u)}H${n1(x + 5)}V${n1(u + 4)}`));
        shape(g, d + `H${n1(d0 + span)}V${n1(u + 9)}Z`);
      } else {
        let d = `M${n1(b.left)},${n1(b.bottom)}V${n1(b.top)}`;
        xs.forEach((x) => (d += `H${n1(x)}V${n1(u)}H${n1(x + 5)}V${n1(b.top)}`));
        shape(g, d + `H${n1(b.right)}V${n1(b.bottom)}Z`);
      }
      return b;
    };
    // Ground line and flag must sit under the wall, so measure the wall first and insert in front
    const towerAt = (g, at, side) => {
      const t = mk("g", {}, g), body = block(t, at, true, true), under = mk("g", {});
      t.prepend(under);
      ground(under, body, "tower");
      if (R() < 0.5) flag(under, body);
      if (!side) { door(t, body); windows(t, body, "tower"); }
    };
    const BUILD = {
      castle(g, at) {
        const gnd = mk("g", {}, g), towers = mk("g", {}, g), body = block(g, at, false, false);
        ground(gnd, body, "castle");
        const left = R() < 0.5, off = R() * 5;
        towerAt(towers, { x: left ? body.left - off : body.right + off, y: body.bottom }, true);
        if (R() < 0.5) towerAt(towers, { x: left ? body.right + off : body.left - off, y: body.bottom }, true);
        door(g, body);
        windows(g, body, "castle", false);
      },
      house(g, at) {
        const x = at.x, y = at.y, top = y - 15, r = top + 2;
        shape(g, `M${x - 10},${top}V${y}H${x + 10}V${top}`);
        shape(g, `M${x + 10},${top}V${y}H${x + 25}V${top}`);
        shape(g, `M${x - 15},${r}L${x},${r - 10}L${x + 15},${r}H${x + 28}L${x + 15},${r - 10}H${x}Z`);
        if (R() < 0.5) shape(g, `M${x + 8},${r - 8}V${r - 14}H${x + 13}V${r - 8}`);
        door(g, { left: x - 10, right: x + 10, bottom: y });
        ground(g, { left: x - 10, right: x + 10, bottom: y }, "house");
        g.setAttribute("transform", `translate(${x + 8} ${y}) scale(0.6) translate(${-x - 8} ${-y})`);
      },
      tower(g, at) { towerAt(g, at, false); },
    };
    const building = {
      down(e) {
        const { inner } = item("buildings", e.point.y), body = mk("g", {}, inner);
        (BUILD[opt("kind", "castle")] || BUILD.castle)(body, e.point);
        pop(inner, 0.4, "bounce.out");
      },
    };

    // Pointer: like the paper tool, movement under the minimum gap is dropped, and past the maximum gap the space between is filled
    const TOOLS = { coast, tree, mountain, route, building };
    let tool = null, last = null;
    const pt = (e) => { const r = svg.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    svg.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      tool = TOOLS[opt("tool", "coast")] || coast;
      svg.setPointerCapture(e.pointerId);
      last = pt(e);
      tool.down?.({ point: last });
    }, on);
    svg.addEventListener("pointermove", (e) => {
      if (!tool?.drag) return;
      const p = pt(e), dx = p.x - last.x, dy = p.y - last.y, dist = Math.hypot(dx, dy);
      if (dist < (tool.min || 0)) return;
      const n = Math.max(1, Math.ceil(dist / (tool.max || Infinity)));
      for (let i = 1; i <= n; i++) tool.drag({ point: { x: last.x + (dx * i) / n, y: last.y + (dy * i) / n }, delta: { x: dx / n, y: dy / n } });
      last = p;
    }, on);
    const up = (e) => { if (!tool) return; tool.up?.({ point: pt(e) }); tool = null; };
    svg.addEventListener("pointerup", up, on);
    svg.addEventListener("pointercancel", up, on);
    el.addEventListener("fx:clear", () => Object.values(layer).forEach((g) => g.replaceChildren()), on);
    return () => { ac.abort(); gsap.ticker.remove(paint); gsap.killTweensOf(svg.querySelectorAll("g")); svg.remove(); };
  });
})();
