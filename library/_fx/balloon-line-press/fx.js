(() => {
  const NS = "http://www.w3.org/2000/svg";
  kfFx.register("balloon-line-press", (el, { options, reduce, hover }) => {
    const count = Math.max(2, +options.lines || 55), R = +(options.radius ?? 140), MIN = +(options.min ?? 0.4);
    const PUSH = +(options.push ?? 110), REACH = 280;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    el.appendChild(svg);
    let lines = [], glows = [], W = 0, H = 0;
    // Same seed gives the same knots — so the shape doesn’t change each time it opens
    let seed = 7;
    const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
    const build = () => {
      W = el.clientWidth; H = el.clientHeight;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      svg.replaceChildren();
      seed = 7;
      lines = []; glows = [];
      for (let g = 0; g < 3; g++) {
        const e = document.createElementNS(NS, "ellipse");
        const bx = W * (0.2 + 0.3 * g), by = H * (0.55 + 0.1 * (g % 2));
        e.setAttribute("cx", bx); e.setAttribute("cy", by); e.setAttribute("rx", W * 0.12); e.setAttribute("ry", H * 0.18);
        e.setAttribute("fill", "currentColor"); e.setAttribute("data-fx-part", "glow");
        svg.appendChild(e);
        glows.push({ e, bx, by, x: 0, y: 0 });
      }
      for (let i = 0; i < count; i++) {
        const x = ((i + 0.5) / count) * W;
        const edge = Math.abs(i / (count - 1) - 0.5) * 2;
        const top = H * (0.62 - 0.6 * edge * edge);
        const g = document.createElementNS(NS, "g");
        g.setAttribute("opacity", (0.35 + 0.65 * (1 - edge)).toFixed(2));
        const stem = document.createElementNS(NS, "rect");
        stem.setAttribute("x", x - 0.75); stem.setAttribute("y", top); stem.setAttribute("width", 1.5); stem.setAttribute("height", H - top);
        stem.setAttribute("fill", "currentColor");
        g.appendChild(stem);
        const balloons = [];
        const n = 2 + ((rnd() * 2) | 0);
        for (let k = 0; k < n; k++) {
          const h = 40 + rnd() * 140, y0 = top + (H - top - h) * ((k + rnd() * 0.8) / n);
          const b = document.createElementNS(NS, "rect");
          b.setAttribute("x", x - 2.5); b.setAttribute("y", y0); b.setAttribute("width", 5); b.setAttribute("height", h); b.setAttribute("rx", 2.5);
          b.setAttribute("fill", "currentColor");
          g.appendChild(b);
          balloons.push({ b, y0, y1: y0 + h, cy: y0 + h / 2, c: 1, anchor: null });
        }
        svg.appendChild(g);
        lines.push({ x, balloons });
      }
    };
    build();
    const ro = new ResizeObserver(() => { if (Math.abs(el.clientWidth - W) > 1 || Math.abs(el.clientHeight - H) > 1) build(); });
    ro.observe(el);
    if (reduce || !hover) return () => { ro.disconnect(); svg.remove(); };

    let mx = -1e5, my = -1e5, inside = 0, last = 0, raf = 0;
    const move = (e) => { const r = el.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; inside = mx >= 0 && my >= 0 && mx <= r.width && my <= r.height ? 1 : 0; wake(); };
    const tick = (now) => {
      raf = 0;
      const dt = last ? Math.min(0.05, Math.max(0.001, (now - last) / 1000)) : 1 / 60;
      last = now;
      const kC = 1 - Math.exp(-8 * dt), kB = 1 - Math.exp(-6 * dt);
      let busy = false;
      for (const L of lines) {
        const far = Math.abs(L.x - mx) > R + 2 || !inside;
        for (const b of L.balloons) {
          let target = 1;
          if (!far) {
            const dx = L.x - mx, dy = my < b.y0 ? b.y0 - my : my > b.y1 ? my - b.y1 : 0;
            const d = Math.hypot(dx, dy);
            if (d < R) { const t = 1 - d / R; target = 1 - (1 - MIN) * (1 - Math.pow(1 - t, 3)); }
          }
          b.c += (target - b.c) * kC;
          if (Math.abs(b.c - 1) > 0.001) busy = true; else b.c = 1;
          // When the press starts, grab the end opposite the cursor — the axis doesn’t jump even if the cursor crosses a joint while pressed
          if (b.c >= 0.999) b.anchor = null; else if (b.anchor === null) b.anchor = my < b.cy ? b.y1 : b.y0;
          b.b.setAttribute("transform", b.c >= 0.999 ? "" : `translate(0 ${b.anchor * (1 - b.c)}) scale(1 ${b.c})`);
        }
      }
      for (const g of glows) {
        let tx = 0, ty = 0;
        if (inside) {
          const dx = g.bx - mx, dy = g.by - my, d = Math.hypot(dx, dy);
          if (d < REACH && d > 0.01) { const f = (1 - d / REACH) * PUSH; tx = (dx / d) * f; ty = (dy / d) * f; }
        }
        g.x += (tx - g.x) * kB; g.y += (ty - g.y) * kB;
        if (Math.abs(tx - g.x) > 0.1 || Math.abs(ty - g.y) > 0.1) busy = true;
        g.e.setAttribute("transform", `translate(${g.x.toFixed(1)} ${g.y.toFixed(1)})`);
      }
      if (busy || inside) raf = requestAnimationFrame(tick); else last = 0;
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };
    addEventListener("pointermove", move, { passive: true });
    return () => { removeEventListener("pointermove", move); cancelAnimationFrame(raf); ro.disconnect(); svg.remove(); };
  });
})();
