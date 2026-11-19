(() => {
  // Original jfa blob: place several points around the edge, each rising and falling at its own tempo (--fr wobble), joined and filled with a curve.
  // On ”full screen” (fx:full), the dots are pushed out past the four screen corners with .7s power3.out to become the background, and on fx:restore they return wobbling with .8s back-blob.
  const BACK_BLOB = "M0,0 C0,0 0.143,0.131 0.326,0.779 0.388,1 0.452,1.039 0.541,1.039 0.633,1.039 0.652,0.932 0.769,0.968 0.873,1 1,1 1,1";
  let backEase = null;
  const getBack = () => {
    if (backEase) return backEase;
    if (window.CustomEase) { gsap.registerPlugin(CustomEase); backEase = CustomEase.create("fx-back-blob", BACK_BLOB); }
    else backEase = "back.out(1.4)";
    return backEase;
  };
  // Closed Catmull-Rom → cubic Bezier
  const pathOf = (pts) => {
    const n = pts.length;
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d + "Z";
  };
  kfFx.register("dot-blob-morph", (el, { options, reduce, hover }) => {
    const n = Math.max(5, Math.round(+options.points || 9));
    const wobble = +(options.wobble ?? 0.05), speed = +(options.speed ?? 1), pull = +(options.cursor ?? 0.08);
    const seed = +(options.seed ?? 1);
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "fx-dbm");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(NS, "path");
    svg.append(path);
    el.prepend(svg);
    // Each dot’s angle, tempo, phase and shape bias are set by a seed — the same seed gives the same shape
    let s = seed * 9301 + 49297;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const dots = Array.from({ length: n }, (_, i) => ({
      a: (i / n) * Math.PI * 2 + (rnd() - 0.5) * 0.35,
      shape: 0.9 + rnd() * 0.18,
      w: 0.6 + rnd() * 0.8,
      ph: rnd() * Math.PI * 2,
      bump: 0,
    }));
    const st = { full: 0, t: 0 };
    let box = { w: 0, h: 0 }, mouse = null, docked = null;
    const measure = () => { const r = el.getBoundingClientRect(); box = { w: r.width, h: r.height, x: r.left, y: r.top }; };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const draw = () => {
      const cx = box.w / 2, cy = box.h / 2;
      // Radius needed to reach when full screen — from the element center to the farthest screen corner + margin
      const far = Math.hypot(Math.max(box.x + cx, innerWidth - box.x - cx), Math.max(box.y + cy, innerHeight - box.y - cy)) * 1.25;
      const pts = dots.map((d) => {
        const wob = reduce ? 0 : wobble * Math.sin(st.t * d.w * speed + d.ph);
        const k = d.shape * (1 + wob + d.bump);
        const rx = cx * k, ry = cy * k;
        const bx = Math.cos(d.a) * rx, by = Math.sin(d.a) * ry;
        const fx = Math.cos(d.a) * far, fy = Math.sin(d.a) * far;
        return [cx + bx + (fx - bx) * st.full, cy + by + (fy - by) * st.full];
      });
      path.setAttribute("d", pathOf(pts));
    };
    let last = 0;
    const tick = (time) => {
      const dt = last ? Math.max(1, (time - last) * 1000) : 16;
      last = time;
      st.t += dt / 1000;
      // Dots near the cursor swell slightly outward (original cursor pull) — catches up 90% in 1 second
      dots.forEach((d) => {
        let goal = 0;
        if (mouse && pull) {
          const ang = Math.atan2(mouse.y - (box.y + box.h / 2), mouse.x - (box.x + box.w / 2));
          const da = Math.abs(Math.atan2(Math.sin(d.a - ang), Math.cos(d.a - ang)));
          const dist = Math.hypot(mouse.x - box.x - box.w / 2, mouse.y - box.y - box.h / 2) / (Math.max(box.w, box.h) * 0.75);
          if (dist < 1.4) goal = pull * Math.max(0, 1 - da / 1.2) * (1.4 - dist) / 1.4;
        }
        d.bump += (goal - d.bump) * (1 - Math.pow(0.1, dt / 1000));
      });
      draw();
    };
    if (reduce) draw();
    else gsap.ticker.add(tick);
    const onMove = (e) => { mouse = { x: e.clientX, y: e.clientY }; };
    const onLeave = () => { mouse = null; };
    if (hover && pull && !reduce) { addEventListener("pointermove", onMove, { passive: true }); document.documentElement.addEventListener("pointerleave", onLeave); }
    // Full screen — move the svg to a fixed spot at the top of the document so it is not clipped
    const dock = () => {
      if (docked) return;
      measure();
      const fill = getComputedStyle(svg).fill;
      docked = document.createElement("div");
      docked.className = "fx-dbm-dock";
      docked.style.cssText = `left:${box.x}px;top:${box.y}px;width:${box.w}px;height:${box.h}px`;
      path.style.fill = fill;
      docked.append(svg);
      document.body.append(docked);
    };
    const undock = () => { if (!docked) return; el.prepend(svg); path.style.fill = ""; docked.remove(); docked = null; };
    let tw = null;
    const full = (e) => {
      tw?.kill();
      dock();
      const dur = +(options.dur ?? 0.7);
      if (reduce) { st.full = 1; draw(); el.dispatchEvent(new CustomEvent("fx:done")); return; }
      tw = gsap.to(st, { full: 1, duration: e?.detail?.dur ?? dur, ease: options.ease ? kfFx.ease(options.ease, "power3.out") : "power3.out", onUpdate: draw, onComplete: () => el.dispatchEvent(new CustomEvent("fx:done")) });
    };
    const restore = () => {
      tw?.kill();
      if (reduce) { st.full = 0; undock(); draw(); return; }
      tw = gsap.to(st, { full: 0, duration: +(options["back-dur"] ?? 0.8), ease: getBack(), onUpdate: draw, onComplete: undock });
    };
    el.addEventListener("fx:full", full);
    el.addEventListener("fx:restore", restore);
    return () => {
      tw?.kill();
      gsap.ticker.remove(tick);
      ro.disconnect();
      removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("fx:full", full);
      el.removeEventListener("fx:restore", restore);
      undock();
      svg.remove();
    };
  });
})();
