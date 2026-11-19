// Shimmering ring — a round ring at the plate center ripples nonstop with three sines, and swells toward the cursor when it comes within 400px.
// The ring is a blurred filled disc, with a background-colored disc laid over it so only the rim remains (eclipse).
(() => {
  const NS = "http://www.w3.org/2000/svg";
  kfFx.register("wobble-ring-cursor", (el, { options, reduce, hover }) => {
    const bulge = +(options.bulge ?? 18), reach = +(options.reach ?? 400) || 400, base = +(options.radius ?? 125), follow = +(options.follow ?? 0.05);
    const coarse = !hover;
    const points = coarse ? 90 : 150;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 300 300");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "fx-wobble-ring");
    const path = document.createElementNS(NS, "path");
    svg.append(path);
    const disc = document.createElement("span");
    disc.className = "fx-wobble-disc";
    el.prepend(svg, disc);
    let px = null, py = null, aim = 0, near = 0, curA = 0, curN = 0, raf = 0, last = -Infinity;
    const shape = (t) => {
      let d = "";
      for (let i = 0; i < points; i++) {
        const a = (Math.PI * 2 * i) / points;
        const r = base + Math.sin(t * 0.4) + 3 * Math.sin(9 * a + t * 0.6) + 2 * Math.sin(5 * a - t * 0.35) + bulge * curN * Math.pow(Math.max(0, Math.cos(a - curA)), 2);
        d += (i ? "L" : "M") + (150 + r * Math.cos(a)).toFixed(2) + "," + (150 + r * Math.sin(a)).toFixed(2) + " ";
      }
      path.setAttribute("d", d + "Z");
    };
    shape(0);
    if (reduce) return () => { svg.remove(); disc.remove(); };
    const frame = (now) => {
      const t = now / 1000;
      if (px !== null) {
        const b = el.getBoundingClientRect();
        const dx = px - (b.left + b.width / 2), dy = py - (b.top + b.height / 2);
        aim = Math.atan2(dy, dx);
        near = Math.max(0, 1 - Math.hypot(dx, dy) / reach);
      } else near = 0;
      let da = (aim - curA) % (Math.PI * 2);
      if (da > Math.PI) da -= Math.PI * 2;
      if (da < -Math.PI) da += Math.PI * 2;
      curA += follow * da;
      curN += follow * (near - curN);
      // Phone renders at a reduced 30fps
      if (!coarse || t - last >= 1 / 30) { last = t; shape(t); }
      raf = requestAnimationFrame(frame);
    };
    const move = (e) => { px = e.clientX; py = e.clientY; };
    const leave = () => { px = py = null; };
    // Runs only while visible
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !raf) raf = requestAnimationFrame(frame);
      else if (!en.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
    });
    io.observe(el);
    addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      svg.remove(); disc.remove();
    };
  });
})();
