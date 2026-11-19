// Meshed gear row: the first gear always turns slowly, and the others follow at the angles where their teeth actually mesh. When scrolling is fast they all speed up together, then settle.
// Meshing: if gear B is in direction θ from A, then φB = θ + π + π/zB + (zA/zB)(θ − φA)
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const gearPath = (z, m, hole) => {
    const rp = (m * z) / 2, ro = rp + m, rr = rp - 1.25 * m, pitch = (2 * Math.PI) / z;
    const P = (r, a) => `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;
    let d = "";
    for (let i = 0; i < z; i++) {
      const a = i * pitch;
      d += (i ? "L" : "M") + P(rr, a - 0.29 * pitch) + "L" + P(ro, a - 0.17 * pitch) + "L" + P(ro, a + 0.17 * pitch) + "L" + P(rr, a + 0.29 * pitch);
      d += `A${rr.toFixed(2)} ${rr.toFixed(2)} 0 0 1 ${P(rr, a + 0.71 * pitch)}`;
    }
    d += "Z";
    if (hole) d += `M${hole} 0A${hole} ${hole} 0 1 0 ${-hole} 0A${hole} ${hole} 0 1 0 ${hole} 0Z`;
    return d;
  };

  kfFx.register("gear-mesh", (el, { options, reduce, scroller }) => {
    const Z = String(options.teeth ?? "22 18").split(/[\s,]+/).map(Number).filter((z) => z >= 6);
    if (!Z.length) return;
    const m = 12, angles = String(options.angles ?? "0").split(/[\s,]+/).map(Number);
    const speed = +(options.speed ?? 0.25), ratio = +(options.ratio ?? -0.8), hole = +(options.hole ?? 0.1);
    const gears = Z.map((z) => ({ z }));
    gears.forEach((g, i) => {
      if (!i) return Object.assign(g, { x: 0, y: 0 });
      const p = gears[i - 1], th = ((angles[i - 1] ?? angles[angles.length - 1] ?? 0) * Math.PI) / 180, d = (m * (p.z + g.z)) / 2 + 0.08 * m;
      Object.assign(g, { th, x: p.x + Math.cos(th) * d, y: p.y + Math.sin(th) * d });
    });
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    gears.forEach((g) => {
      g.el = document.createElementNS(NS, "path");
      g.el.setAttribute("fill-rule", "evenodd");
      g.el.setAttribute("d", gearPath(g.z, m, m * g.z * hole));
      svg.append(g.el);
    });
    const ro = (g) => m * (g.z / 2 + 1), pad = 4;
    const x0 = Math.min(...gears.map((g) => g.x - ro(g))) - pad, x1 = Math.max(...gears.map((g) => g.x + ro(g))) + pad;
    const y0 = Math.min(...gears.map((g) => g.y - ro(g))) - pad, y1 = Math.max(...gears.map((g) => g.y + ro(g))) + pad;
    svg.setAttribute("viewBox", `${x0} ${y0} ${x1 - x0} ${y1 - y0}`);
    el.append(svg);

    const drive = (phi0) => {
      let phi = phi0;
      gears.forEach((g, i) => {
        if (i) { const p = gears[i - 1]; phi = g.th + Math.PI + Math.PI / g.z + (p.z / g.z) * (g.th - phi); }
        g.el.setAttribute("transform", `translate(${g.x.toFixed(2)} ${g.y.toFixed(2)}) rotate(${((phi * 180) / Math.PI).toFixed(2)})`);
      });
    };
    drive(0);
    if (reduce) return () => svg.remove();

    // Scroll acceleration: scroll amount per frame × 0.02 (max 3), followed in 0.08 steps
    const pos = () => (scroller ? scroller.scrollTop : scrollY);
    let phase = 0, boost = 0, last = pos(), seen = true;
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting));
    io.observe(el);
    const tick = (t, dt) => {
      const now = pos(), v = Math.abs(now - last);
      last = now;
      boost += (Math.min(v * 0.02, 3) - boost) * 0.08;
      phase += ((speed + boost) * Math.max(0, dt)) / 1000;
      if (seen) drive(phase * ratio);
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); io.disconnect(); svg.remove(); };
  });
})();
