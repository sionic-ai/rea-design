// Several wires curve from top right to bottom left and gather into one bundle, over which two short comet tails pass alternately.
// The bundle is painted green only inside the band and kept as a very pale gray line outside — so the line looks continuous across the section boundary into the section above.
// Strand color breathes between .8~1 on a 5.2s cycle, and a comet follows a strand for 1~2 seconds with quadratic easeInOut, fading at the front 18% and back 22%
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgbOf = (css, host) => {
    const sw = document.createElement("i");
    sw.style.cssText = `position:absolute;visibility:hidden;color:${css}`;
    host.append(sw);
    const c = getComputedStyle(sw).color;
    sw.remove();
    probe.clearRect(0, 0, 1, 1); probe.fillStyle = c; probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return `rgb(${d[0]},${d[1]},${d[2]})`;
  };
  const mk = (tag, attrs = {}) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };
  const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
  const rand = (a, b) => a + Math.random() * (b - a);
  let uid = 0;

  // Bundle shape: the top start points are offset by (+48, +95) per strand, and the bottom-left ends gather at 16px intervals
  const wirePath = (i, n) => {
    const k = i - (n - 1) / 2;
    const sx = 1169 + 48.4 * k, sy = 279 + 95.3 * k;
    const mx = 235 + 8.3 * k, my = 758 + 16.4 * k;
    const ex = -18 + 8.3 * k, ey = 873 + 16.4 * k;
    return `M${sx.toFixed(1)} ${sy.toFixed(1)}C${(sx - 442.3).toFixed(1)} ${(sy + 225.3).toFixed(1)} ${(mx + 248 + 8 * k).toFixed(1)} ${(my - 126 - 30 * k).toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}C${(mx - 198.4).toFixed(1)} ${(my + 101.1).toFixed(1)} ${(mx - 209.1).toFixed(1)} ${(my + 106.6).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
  };

  kfFx.register("comet-wires", (el, { options, reduce }) => {
    if (!(el instanceof SVGSVGElement)) return;
    const n = Math.max(2, +options.count || 8), VW = 848, VH = 868;
    const streak = +(options.streak ?? 32), comets = Math.max(1, +options.comets || 2);
    const dMin = +(options["dur-min"] ?? 1) * 1000, dMax = +(options["dur-max"] ?? 2) * 1000;
    const gMin = +(options["gap-min"] ?? 0.9) * 1000, gMax = +(options["gap-max"] ?? 3.2) * 1000;
    const yIn = +(options["y-in"] ?? 200), yOut = +(options["y-out"] ?? 880);
    const id = `fxcw${++uid}`;
    el.setAttribute("viewBox", `0 0 ${VW} ${VH}`);
    el.setAttribute("fill", "none");
    el.setAttribute("aria-hidden", "true");
    el.classList.add("fx-cw");
    const before = [...el.childNodes];
    const defs = mk("defs"), mask = mk("mask", { id: `${id}-band` }), bandRect = mk("rect", { x: 0, y: 0, width: VW, height: VH, fill: "white" }); // Not skin: the mask reads luminance only
    mask.append(mk("rect", { x: 0, y: 0, width: VW, height: VH, fill: "black" }), bandRect); // Not skin: the mask reads luminance only
    defs.append(mask);
    const grads = Array.from({ length: comets }, (_, c) => {
      const g = mk("linearGradient", { id: `${id}-c${c}`, gradientUnits: "userSpaceOnUse", x1: 0, y1: 0, x2: -streak, y2: 0 });
      g.append(mk("stop", { offset: "0.2" }), mk("stop", { offset: "1", "stop-opacity": "0" }));
      defs.append(g);
      return g;
    });
    const base = mk("g", { class: "fx-cw__base" }), lit = mk("g", { mask: `url(#${id}-band)` });
    const paths = [], glows = [];
    for (let i = 0; i < n; i++) {
      const d = wirePath(i, n);
      const p = mk("path", { d, stroke: "currentColor", "stroke-width": 1, "vector-effect": "non-scaling-stroke" });
      const q = mk("path", { d, "stroke-width": +(options.stroke ?? 1.15), "vector-effect": "non-scaling-stroke" });
      base.append(p); lit.append(q); paths.push(p); glows.push(q);
    }
    const heads = grads.map((g, c) => { const h = mk("g", { stroke: `url(#${id}-c${c})`, "stroke-width": 2, "stroke-linecap": "round", opacity: 0 }); h.append(mk("path")); lit.append(h); return h; });
    el.append(defs, base, lit);

    let palette = [];
    const paint = () => {
      const a = rgbOf("var(--kf-accent)", el), b = rgbOf("oklch(from var(--kf-accent) calc(l + .113) calc(c + .053) calc(h - 33.4))", el);
      const pa = a.match(/\d+/g).map(Number), pb = b.match(/\d+/g).map(Number);
      glows.forEach((q, i) => q.setAttribute("stroke", `rgb(${pa.map((v, k) => Math.round(v + (pb[k] - v) * (i / (n - 1))))})`));
      palette = [
        "oklch(from var(--kf-accent) calc(l - .01) calc(c - .013) calc(h - 90.8))",
        "oklch(from var(--kf-accent) calc(l - .071) calc(c + .023) calc(h + 154.3))",
        "oklch(from var(--kf-accent) calc(l - .081) calc(c - .025) calc(h + 84.8))",
        "oklch(from var(--kf-accent) calc(l + .014) calc(c - .054) calc(h - 173.1))",
      ].map((c) => rgbOf(c, el));
    };
    paint();

    // Band: horizontal extent of the section holding the attached svg (or the element picked by band) × from the section top downward
    const host = el.closest(options.section || "section") || el.parentElement;
    const bandEl = (options.band && host?.querySelector(options.band)) || host;
    const fitBand = () => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || !bandEl) return;
      const b = bandEl.getBoundingClientRect(), top = (host || bandEl).getBoundingClientRect().top;
      const sx = (x) => Math.max(0, Math.min(VW, ((x - r.left) / r.width) * VW));
      const sy = (y) => Math.max(0, Math.min(VH, ((y - r.top) / r.height) * VH));
      const x0 = sx(b.left), x1 = sx(b.right), y0 = sy(top);
      bandRect.setAttribute("x", x0); bandRect.setAttribute("y", y0);
      bandRect.setAttribute("width", Math.max(0, x1 - x0)); bandRect.setAttribute("height", VH - y0);
    };
    fitBand();
    const ro = new ResizeObserver(fitBand);
    ro.observe(el); if (host) ro.observe(host);

    // Sample 64 points per strand — the comet walks along these points
    const samples = paths.map((p) => { const L = p.getTotalLength(); return Array.from({ length: 64 }, (_, j) => { const pt = p.getPointAtLength((L * j) / 63); return { x: pt.x, y: pt.y }; }); });
    const lanes = samples.map((s) => { let a = -1, b = -1; s.forEach((pt, j) => { if (pt.y >= yIn && a < 0) a = j; if (pt.y <= yOut) b = j; }); return a < 0 || b <= a ? null : { a, b }; });
    const usable = lanes.map((l, i) => (l ? i : -1)).filter((i) => i >= 0);
    if (reduce || !usable.length) { glows.forEach((q) => (q.style.opacity = "0.82")); const off = () => { ro.disconnect(); el.replaceChildren(...before); el.classList.remove("fx-cw"); }; return off; }

    const state = heads.map((_, c) => ({ wire: usable[c % usable.length], color: c % 4, begin: 0, dur: rand(dMin, dMax) }));
    let raf = 0, on = false, t0 = 0, away = 0;
    const tick = (now) => {
      if (!t0) { t0 = now; state.forEach((s, c) => (s.begin = now - s.dur * ((c + 0.5) / state.length))); }
      const ph = (now - t0) / 5200;
      glows.forEach((q, i) => { q.style.opacity = String(0.8 + 0.2 * ((Math.sin((ph + i * 0.085) * Math.PI * 2 - Math.PI / 2) + 1) / 2)); });
      const busy = new Set(state.filter((s) => { const u = (now - s.begin) / s.dur; return u >= 0 && u < 1; }).map((s) => s.wire));
      state.forEach((s, c) => {
        const h = heads[c], u = (now - s.begin) / s.dur, lane = lanes[s.wire];
        if (u < 0 || u >= 1 || !lane) {
          if (u >= 1) {
            busy.delete(s.wire);
            const free = usable.filter((w) => !busy.has(w));
            s.wire = (free.length ? free : usable)[Math.floor(Math.random() * (free.length || usable.length))];
            busy.add(s.wire);
            s.color = Math.floor(Math.random() * 4);
            s.dur = rand(dMin, dMax);
            s.begin = now + rand(gMin, gMax);
          }
          h.setAttribute("opacity", 0);
          return;
        }
        const pts = samples[s.wire], f = lane.a + (lane.b - lane.a) * ease(u), j = Math.floor(f), j2 = Math.min(pts.length - 1, j + 1), r = f - j;
        const x = pts[j].x + (pts[j2].x - pts[j].x) * r, y = pts[j].y + (pts[j2].y - pts[j].y) * r;
        const line = [{ x, y }];
        let left = streak, px = x, py = y;
        for (let m = j; m >= 0 && left > 0; m--) {
          const pt = pts[m], dd = Math.hypot(px - pt.x, py - pt.y);
          if (dd >= left) { const q = left / (dd || 1); line.push({ x: px + (pt.x - px) * q, y: py + (pt.y - py) * q }); left = 0; }
          else if (dd > 0) { line.push(pt); left -= dd; px = pt.x; py = pt.y; }
        }
        h.firstChild.setAttribute("d", line.map((p, k) => `${k ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(""));
        const g = grads[c], tail = line[line.length - 1];
        g.setAttribute("x1", line[0].x.toFixed(1)); g.setAttribute("y1", line[0].y.toFixed(1));
        g.setAttribute("x2", tail.x.toFixed(1)); g.setAttribute("y2", tail.y.toFixed(1));
        for (const st of g.children) st.setAttribute("stop-color", palette[s.color]);
        h.setAttribute("opacity", Math.min(1, u / 0.18) * Math.min(1, (1 - u) / 0.22));
      });
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (on) return; on = true; if (away && t0) { const gap = performance.now() - away; t0 += gap; state.forEach((s) => (s.begin += gap)); } raf = requestAnimationFrame(tick); }
      else if (on) { on = false; cancelAnimationFrame(raf); away = performance.now(); }
    }, { rootMargin: "15% 0px" });
    io.observe(el);
    const mo = new MutationObserver(paint);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); mo.disconnect(); el.replaceChildren(...before); el.classList.remove("fx-cw"); };
  });
})();
