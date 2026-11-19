// Not carrying over the original-shaped path, build a blob shape from a seed count, SMIL <animate> Makes three shapes spin — dozens per scene, so leave it to the browser instead of GSAP tweens.
// SMIL only blends between types when point count and command order match, so several same-structure types are drawn from one seed.
(() => {
  const rng = (seed) => {
    let s = (seed * 2654435761) >>> 0 || 1;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  };
  const n1 = (v) => Math.round(v * 10) / 10;
  const shape = (r, w, h, n, wob) => {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (r() - 0.5) * (Math.PI / n) * 0.9;
      const k = 1 - wob * r();
      pts.push([w / 2 + Math.cos(a) * (w / 2) * k * 0.97, h / 2 + Math.sin(a) * (h / 2) * k * 0.97]);
    }
    let d = `M${n1(pts[0][0])} ${n1(pts[0][1])}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${n1(c1[0])} ${n1(c1[1])} ${n1(c2[0])} ${n1(c2[1])} ${n1(p2[0])} ${n1(p2[1])}`;
    }
    return d + "Z";
  };

  kfFx.register("svg-blob-morph", (el, { options, reduce }) => {
    if (el.namespaceURI !== "http://www.w3.org/2000/svg") return;
    const path = el.localName === "path" ? el : el.querySelector('path[data-fx-part="blob"], path');
    if (!path) return;
    const box = (options.box || "").split(/[\s,]+/).map(Number).filter((v) => v > 0);
    const vb = path.ownerSVGElement?.viewBox?.baseVal;
    const w = box[0] || vb?.width || 100, h = box[1] || vb?.height || 100;
    const seed = +(options.seed ?? 1), n = Math.max(4, +options.points || 8);
    const wob = Math.min(0.8, Math.max(0, +(options.wobble ?? 0.32)));
    const frames = Math.max(2, +options.frames || 3);
    const r = rng(seed);
    const looks = Array.from({ length: frames }, () => shape(r, w, h, n, wob));
    const had = path.getAttribute("d");
    path.setAttribute("d", looks[0]);
    if (reduce || options.static === "true") return () => { had == null ? path.removeAttribute("d") : path.setAttribute("d", had); };
    const anim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
    anim.setAttribute("attributeName", "d");
    anim.setAttribute("dur", `${+(options.dur ?? 15)}s`);
    anim.setAttribute("begin", `${+(options.begin ?? 0)}s`);
    anim.setAttribute("repeatCount", "indefinite");
    anim.setAttribute("values", [...looks, looks[0]].join(";"));
    path.append(anim);
    return () => { anim.remove(); had == null ? path.removeAttribute("d") : path.setAttribute("d", had); };
  });
})();
