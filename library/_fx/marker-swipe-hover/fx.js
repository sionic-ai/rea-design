// Two-stroke highlighter hover — on hover the top stroke (left → right) and bottom stroke (right → left) are drawn and the text there flips to the inverted color. On release the strokes retract from the starting point.
// Letters flip using an overlay that clones the element’s children (clip-path polygon) — the original text stays untouched, so reading and screen readers aren’t disturbed
(() => {
  kfFx.register("marker-swipe-hover", (el, { options, reduce, hover }) => {
    if (!window.gsap || !el.childNodes.length) return;
    const d = reduce ? 0 : +(options.dur ?? 0.16), lag = +(options.lag ?? 0.3), outK = +(options.out ?? 0.85);
    const NS = "http://www.w3.org/2000/svg", strokes = document.createElementNS(NS, "svg"), label = document.createElement("span");
    strokes.setAttribute("class", "fx-msh__strokes"); strokes.setAttribute("aria-hidden", "true");
    label.className = "fx-msh__label"; label.setAttribute("aria-hidden", "true");
    const fill = () => label.replaceChildren(...[...el.childNodes].filter((n) => n !== strokes && n !== label).map((n) => n.cloneNode(true)));
    el.prepend(strokes);
    el.append(label);
    const st = { s1: 0, e1: 0, s2: 0, e2: 0 }, was = { ...st };
    let u = 1, ends = [[7, 11], [12, 5]], lit = false, lines = [], key = "", seq = 0;
    const clamp01 = (v) => Math.min(1, Math.max(0, v));
    // A single stroke = Six gradient stops — only the s..e segment is visible, both ends (ls·le) are feathery soft
    const stops = (list, s, e, ls, le) => {
      const span = Math.max(0, e - s), k = ls + le > 0.9 * span && ls + le > 0 ? (0.9 * span) / (ls + le) : 1;
      const c = clamp01(s), l = clamp01(s + ls * k), r = clamp01(e), on = span > 5e-4 ? 1 : 0;
      [[0, 0], [c, 0], [l, on], [Math.max(l, clamp01(e - le * k)), on], [r, 0], [1, 0]].forEach(([o, op], i) => { list[i].setAttribute("offset", String(o)); list[i].setAttribute("stop-opacity", String(op)); });
    };
    const shape = () => {
      const w = el.offsetWidth, h = el.offsetHeight, next = `${w}x${h}`;
      if (next === key) return;
      key = next; u = Math.max(1, w);
      const half = h / 2, tilt = Math.min(0.05 * h, 3), k = Math.min(1, Math.max(0.45, h / 48));
      ends = [[7 * k, 11 * k], [12 * k, 5 * k]];
      strokes.setAttribute("viewBox", `-18 -18 ${w + 36} ${h + 36}`);
      strokes.replaceChildren();
      const defs = document.createElementNS(NS, "defs");
      strokes.append(defs);
      lines = ends.map(([out, over], i) => {
        const y = half * (i + 0.5), from = i % 2 ? [w + over, y - tilt] : [-out, y + tilt], to = i % 2 ? [-out, y + tilt] : [w + over, y - tilt];
        const grad = document.createElementNS(NS, "linearGradient"), path = document.createElementNS(NS, "path");
        grad.id = `fx-msh-${Math.random().toString(36).slice(2, 8)}-${seq++}`; grad.setAttribute("gradientUnits", "userSpaceOnUse");
        Object.entries({ x1: from[0], y1: from[1], x2: to[0], y2: to[1] }).forEach(([n, v]) => grad.setAttribute(n, String(v)));
        const list = Array.from({ length: 6 }, () => { const s = document.createElementNS(NS, "stop"); s.setAttribute("stop-color", "currentColor"); grad.append(s); return s; });
        defs.append(grad);
        path.setAttribute("d", `M${from[0]} ${from[1]} L${to[0]} ${to[1]}`); path.setAttribute("fill", "none"); path.setAttribute("stroke-linecap", "butt"); path.setAttribute("stroke", `url(#${grad.id})`); path.style.strokeWidth = `${1.42 * half}px`;
        strokes.append(path);
        return list;
      });
    };
    // The text cover measures progress including the length the stroke extends outside the element — it starts flipping when the stroke head touches the letter.
    // Edges lag by half of the frame-to-frame movement ×2.2 (max .3), so it looks smooth when fast
    const paint = (still) => {
      const f = {};
      for (const key in st) f[key] = still === true ? 0 : Math.min(0.3, Math.abs(st[key] - was[key]) * 2.2);
      Object.assign(was, st);
      if (lines.length === 2) { stops(lines[0], st.s1, st.e1, f.s1, f.e1); stops(lines[1], st.s2, st.e2, f.s2, f.e2); }
      const [[l1, r1], [l2, r2]] = ends, pc = (x) => (Math.min(u, Math.max(0, x)) / u * 100).toFixed(2) + "%";
      const E = (v) => pc(v * (u + l1 + r1) - l1), A = (v) => pc(u + r2 - v * (u + r2 + l2));
      const S = E(st.s1 + f.s1 / 2), K = E(st.e1 - f.e1 / 2), Q = A(st.e2 - f.e2 / 2), R = A(st.s2 + f.s2 / 2);
      label.style.clipPath = `polygon(${S} -40%, ${K} -40%, ${K} 55%, ${R} 55%, ${R} 140%, ${Q} 140%, ${Q} 55%, ${S} 55%)`;
    };
    let tl = null;
    const on = () => {
      if (lit) return;
      lit = true;
      fill();
      shape();
      tl?.kill();
      Object.assign(st, { s1: 0, e1: 0, s2: 0, e2: 0 });
      Object.assign(was, st);
      paint(true);
      tl = gsap.timeline({ onUpdate: paint, onComplete: () => paint(true) }).to(st, { e1: 1, duration: d, ease: "power4.out" }, 0).to(st, { e2: 1, duration: d, ease: "power4.out" }, lag * d);
      // Start half a frame earlier — the original is already .21–.26 out on the first drawing
      if (d) tl.startTime(tl.startTime() - 1 / 120);
    };
    const off = () => {
      lit = false;
      tl?.kill();
      const k = outK * d;
      tl = gsap.timeline({ onUpdate: paint, onComplete: () => paint(true) }).to(st, { s1: 1, e1: 1, duration: k, ease: "power4.out" }, 0).to(st, { s2: 1, e2: 1, duration: k, ease: "power4.out" }, 0.4 * k);
      if (k) tl.startTime(tl.startTime() - 1 / 120);
    };
    shape();
    paint(true);
    const ac = new AbortController(), sig = { signal: ac.signal };
    if (hover) {
      el.addEventListener("pointerenter", (e) => { if (e.pointerType !== "touch") on(); }, sig);
      el.addEventListener("pointerleave", (e) => { if (e.pointerType !== "touch") off(); }, sig);
    }
    el.addEventListener("focusin", () => { if (el.matches(":focus-visible") || el.querySelector(":focus-visible")) on(); }, sig);
    el.addEventListener("focusout", off, sig);
    el.addEventListener("fx:mark", (e) => (e.detail === false ? off() : on()), sig);
    return () => { ac.abort(); tl?.kill(); strokes.remove(); label.remove(); };
  });
})();
