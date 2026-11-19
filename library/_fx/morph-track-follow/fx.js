// A shape on a dotted path follows the mouse (drag on phones), changing form and rotating — contact track values from the original Brand contact page (.1s, 0→450°, trail power2.out).
(() => {
  const C = 110, R = 92, NS = "http://www.w3.org/2000/svg";
  const ngon = (n, r) => "M" + Array.from({ length: n }, (_, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; return `${(C + r * Math.cos(a)).toFixed(1)} ${(C + r * Math.sin(a)).toFixed(1)}`; }).join("L") + "Z";
  const star = (n, ro, ri) => "M" + Array.from({ length: n * 2 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / n, r = i % 2 ? ri : ro; return `${(C + r * Math.cos(a)).toFixed(1)} ${(C + r * Math.sin(a)).toFixed(1)}`; }).join("L") + "Z";
  const circle = `M${C - R} ${C}a${R} ${R} 0 1 0 ${2 * R} 0a${R} ${R} 0 1 0 ${-2 * R} 0Z`;
  const form = (k) => (k === "0" ? circle : k === "s" ? star(6, R, R * 0.72) : ngon(Math.max(3, +k || 4), +k === 4 ? R * 1.05 : R));
  kfFx.register("morph-track-follow", (root, { options, reduce, hover }) => {
    if (!window.gsap) return;
    const made = [];
    const mk = (part, parent, tag, ns) => {
      let n = root.querySelector(`[data-fx-part="${part}"]`);
      if (!n) { n = ns ? document.createElementNS(NS, tag) : document.createElement(tag); n.setAttribute("data-fx-part", part); parent.prepend(n); made.push(n); }
      return n;
    };
    mk("dash", root, "i");
    const shape = mk("shape", root, "span");
    let svg = shape.querySelector("svg");
    if (!svg) { svg = document.createElementNS(NS, "svg"); svg.setAttribute("viewBox", "0 0 220 220"); svg.setAttribute("aria-hidden", "true"); shape.prepend(svg); made.push(svg); }
    let path = svg.querySelector("path");
    if (!path) { path = document.createElementNS(NS, "path"); svg.append(path); }
    const keys = (options.sides || "4,5,6,s,8,0").split(",").map((s) => s.trim()).filter(Boolean);
    if (keys.length < 2) return () => made.forEach((n) => n.remove());
    const turn = +(options.turn ?? 90), follow = +(options.follow ?? 0.1), fade = +(options.trail ?? 0.8);
    const cps = keys.map((k, i) => ({ p: i / (keys.length - 1), rot: i * turn, d: form(k) }));
    path.setAttribute("d", cps[0].d);
    const canMorph = !!window.MorphSVGPlugin;
    if (canMorph) gsap.registerPlugin(MorphSVGPlugin);
    const tl = gsap.timeline({ paused: true });
    for (let i = 1; i < cps.length; i++) {
      const v = { rotation: cps[i].rot, svgOrigin: `${C} ${C}`, duration: cps[i].p - cps[i - 1].p, ease: "none" };
      if (canMorph) v.morphSVG = { shape: cps[i].d, type: "rotational", origin: "50% 50%" };
      tl.to(path, v, cps[i - 1].p);
    }
    let prog = 0, size = 0;
    const trails = new Map();
    const measure = () => (size = shape.getBoundingClientRect().width || 220);
    const leftAt = (p) => p * Math.max(0, root.clientWidth - size);
    const ghost = (i) => {
      const s = document.createElementNS(NS, "svg"), p = document.createElementNS(NS, "path");
      s.setAttribute("viewBox", "0 0 220 220"); s.setAttribute("data-fx-part", "trail"); s.setAttribute("aria-hidden", "true");
      p.setAttribute("d", cps[i].d); s.append(p);
      s.style.left = `${leftAt(cps[i].p)}px`; s.style.transform = `rotate(${cps[i].rot}deg)`;
      root.append(s);
      gsap.to(s, { opacity: 0, duration: reduce ? 0 : fade + trails.size * 0.15, ease: "power2.out", onComplete: () => { s.remove(); if (trails.get(i) === s) trails.delete(i); } });
      return s;
    };
    const go = (p, soft) => {
      const prev = prog;
      prog = Math.min(1, Math.max(0, p));
      tl.progress(prog);
      gsap.to(shape, { x: leftAt(prog), duration: soft && !reduce ? follow : 0, ease: "none", overwrite: "auto" });
      cps.forEach((c, i) => {
        const e = 0.001;
        if ((prog > prev && prev < c.p + e && prog >= c.p + e) || (prog < prev && prev > c.p - e && prog <= c.p - e)) { trails.get(i)?.remove(); trails.set(i, ghost(i)); }
      });
    };
    const fromX = (x) => { const r = root.getBoundingClientRect(); const half = size / 2; return (Math.min(r.width - half, Math.max(half, x - r.left)) - half) / Math.max(1, r.width - size); };
    measure();
    const onMove = (e) => go(fromX(e.clientX), true);
    let drag = null;
    if (hover) root.addEventListener("mousemove", onMove);
    else if (window.Draggable) drag = Draggable.create(shape, { type: "x", bounds: root, onDrag() { go(this.x / Math.max(1, root.clientWidth - size), false); } })[0];
    const onResize = () => { measure(); go(prog, false); };
    addEventListener("resize", onResize);
    return () => {
      root.removeEventListener("mousemove", onMove);
      removeEventListener("resize", onResize);
      drag?.kill();
      tl.kill();
      trails.forEach((s) => s.remove());
      gsap.set(shape, { clearProps: "transform" });
      made.forEach((n) => n.remove());
    };
  });
})();
