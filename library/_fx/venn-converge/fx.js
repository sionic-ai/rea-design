// Two-circle overlap graphic: when the panel passes the screen’s center line, two circles that were apart at the ends approach each other over dur (2s) with cubic in-out and overlap by overlap%,
// Sand-grain dot patterns show only inside overlapping lenses. Labels attach to the center of the non-empty side of each circle and follow — Studio (About Design·Technology)
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const make = (tag, attrs = {}) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };
  // Same dot pattern every time from one seed
  const seeded = (seed) => () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  let uid = 0;
  kfFx.register("venn-converge", (el, { options, reduce }) => {
    const labels = [...el.querySelectorAll('[data-fx-part="label"]')].map((n) => n.textContent.trim());
    const overlap = +(options.overlap ?? 42), spread = +(options.spread ?? 100), sizePct = +(options.size ?? 100);
    const dur = +(options.dur ?? 2), delay = +(options.delay ?? 0), shift = +(options["label-shift"] ?? -4);
    const grainDensity = +(options.grain ?? 13), grainSize = +(options["grain-size"] ?? 0.7), replay = options.replay === "true";
    const id = `fx-venn-${++uid}`, TILE = 48;
    const svg = make("svg", { "aria-hidden": "true" });
    svg.dataset.fxPart = "art";
    const defs = make("defs"), pat = make("pattern", { id: `${id}-sand`, width: TILE, height: TILE, patternUnits: "userSpaceOnUse" });
    const rand = seeded(7), count = Math.round((grainDensity * TILE * TILE) / 196);
    for (let i = 0; i < count; i++) pat.append(make("circle", { cx: rand() * TILE, cy: rand() * TILE, r: grainSize * (0.6 + rand() * 0.6), class: "fx-venn-grain" }));
    const clip = make("clipPath", { id: `${id}-clip` }), clipC = make("circle");
    clip.append(clipC); defs.append(pat, clip);
    const lens = make("circle", { fill: `url(#${id}-sand)`, "clip-path": `url(#${id}-clip)` });
    const cl = make("circle", { class: "fx-venn-ring" }), cr = make("circle", { class: "fx-venn-ring" });
    const tl = make("text", { "text-anchor": "middle", "dominant-baseline": "central", class: "fx-venn-label" });
    const tr = make("text", { "text-anchor": "middle", "dominant-baseline": "central", class: "fx-venn-label" });
    tl.textContent = labels[0] || ""; tr.textContent = labels[1] || "";
    svg.append(defs, lens, cl, cr, tl, tr);
    el.append(svg);
    let W = 0, H = 0, t = 0, tween = null, played = false;
    const draw = () => {
      const c = W / 2, u = 1 - overlap / 100;
      const r = Math.max(1, Math.min(H / 2, W / (2 + 2 * u)) * (sizePct / 100));
      const near = r * u, far = Math.max(near, (W / 2 - r - 1) * (spread / 100));
      const m = far + (near - far) * t, xl = c - m, xr = c + m, cy = H / 2;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      for (const [n, x] of [[clipC, xl], [cl, xl], [lens, xr], [cr, xr]]) { n.setAttribute("cx", x); n.setAttribute("cy", cy); n.setAttribute("r", r); }
      tl.setAttribute("x", (xl - r + Math.min(xl + r, xr - r)) / 2 - shift * t); tl.setAttribute("y", cy);
      tr.setAttribute("x", (Math.max(xr - r, xl + r) + xr + r) / 2 + shift * t); tr.setAttribute("y", cy);
    };
    const measure = () => { W = el.clientWidth; H = el.clientHeight; draw(); };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    const play = () => {
      if (played) return;
      played = true;
      if (reduce) { t = 1; draw(); return; }
      const s = { v: t };
      tween = gsap.to(s, { v: 1, duration: dur, delay, ease: "power2.inOut", onUpdate: () => { t = s.v; draw(); } });
    };
    if (el.getBoundingClientRect().bottom < innerHeight / 2) { played = true; t = 1; draw(); }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) play(); }, { rootMargin: "-50% 0px -50% 0px" });
    const out = new IntersectionObserver((es) => { if (replay && played && es.every((e) => !e.isIntersecting)) { tween?.kill(); played = false; t = 0; draw(); } });
    io.observe(el); out.observe(el);
    return () => { io.disconnect(); out.disconnect(); ro.disconnect(); tween?.kill(); svg.remove(); };
  });
})();
