(() => {
  // Draw lines+1 horizontal lines evenly across the panel height (leaving only the top and bottom pad empty) and join points+1 nodes per line with quadratic curves.
  // A node within the cursor’s radius square is pushed outward by (radius − distance), and pulled back toward home by distance from home × spring,
  // Add the two, multiply by damp, and clamp to ±max px per frame (the original does it per frame — here it is split into 60Hz steps so it is independent of the screen refresh rate).
  // The original offsets the push-away center up and left from the cursor by offset px — we carry over even that shift, which looks like the shadow of a 15px square cursor, as an option.
  kfFx.register("repel-line-field", (el, { options, reduce, hover }) => {
    const lines = Math.max(1, +options.lines || 32), points = Math.max(2, +options.points || 20);
    const radius = +(options.radius ?? 100), max = +(options.max ?? 15), pad = +(options.pad ?? 70);
    const spring = +(options.spring ?? 0.2), damp = +(options.damp ?? 0.9), offset = +(options.offset ?? 50), stroke = +(options.width ?? 2);
    const from = +(options.from ?? 0);
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.setAttribute("data-fx-part", "canvas");
    el.append(canvas);
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, rows = [], homeY = [], homeX = [], raf = 0, last = 0, acc = 0, seen = true, calm = 0;
    const mouse = { x: -1e4, y: -1e4, in: false };
    const live = () => !reduce && hover && innerWidth >= from;

    const build = () => {
      w = el.clientWidth; h = el.clientHeight;
      const dpr = Math.min(2, devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.floor(w * dpr)); canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rows = []; homeY = []; homeX = [];
      const span = Math.max(0, h - pad * 2 - 2);
      for (let r = lines; r >= 0; r--) {
        const y = r === 0 ? pad : r === lines ? (span / lines) * r + pad + 1 : (span / lines) * r + pad;
        homeY.push(y);
        const row = [];
        for (let a = points; a >= 0; a--) {
          const x = Math.round((w / points) * a);
          row.push({ x, y });
          if (r === lines) homeX.push(x);
        }
        rows.push(row);
      }
    };

    const step = () => {
      let moving = 0;
      const cx = mouse.x - offset, cy = mouse.y - offset;
      for (let li = 0; li < rows.length; li++) {
        const row = rows[li], hy = homeY[li];
        for (let i = row.length - 1; i >= 0; i--) {
          const p = row[i];
          const sx = (homeX[i] - p.x) * spring, sy = (hy - p.y) * spring;
          let px = 0, py = 0;
          const ax = p.x - cx, ay = p.y - cy;
          if (mouse.in && Math.abs(ax) <= radius && Math.abs(ay) <= radius) {
            const d = Math.hypot(ax, ay), f = Math.max(0, Math.min(radius - d, radius)), e = Math.atan2(ay, ax);
            px = f * Math.cos(e); py = f * Math.sin(e);
          }
          const mx = Math.max(-max, Math.min(max, (px + sx) * damp)), my = Math.max(-max, Math.min(max, (py + sy) * damp));
          if (Math.abs(mx) > 0.01 || Math.abs(my) > 0.01) moving++;
          p.x += mx; p.y += my;
        }
      }
      return moving;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = getComputedStyle(el).color;
      ctx.lineWidth = stroke;
      for (const o of rows) {
        ctx.beginPath();
        ctx.moveTo(o[o.length - 1].x, o[o.length - 1].y);
        let n = o.length - 2;
        for (; n > 1; n--) {
          const a = o[n], b = o[n - 1];
          ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
        }
        ctx.quadraticCurveTo(o[n].x, o[n].y, o[n - 1].x, o[n - 1].y);
        ctx.stroke();
      }
    };

    const tick = (now) => {
      raf = 0;
      if (!last) last = now;
      acc += Math.max(1, now - last);
      last = now;
      let moving = 0, steps = 0;
      while (acc >= 16.67 && steps < 4) { moving = step(); acc -= 16.67; steps++; }
      if (steps === 4) acc = 0;
      draw();
      calm = moving ? 0 : calm + 1;
      if (seen && (mouse.in || calm < 3)) raf = requestAnimationFrame(tick);
      else last = 0;
    };
    const wake = () => { if (!raf && seen && live()) raf = requestAnimationFrame(tick); };

    const move = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      mouse.in = mouse.x > -radius - offset && mouse.x < w + radius + offset && mouse.y > -radius - offset && mouse.y < h + radius + offset;
      if (mouse.in) { calm = 0; wake(); }
    };
    const leave = () => { mouse.in = false; wake(); };

    build(); draw();
    const ro = new ResizeObserver(() => { if (el.clientWidth !== w || el.clientHeight !== h) { build(); draw(); } });
    ro.observe(el);
    const io = new IntersectionObserver(([en]) => { seen = en.isIntersecting; if (seen) wake(); });
    io.observe(el);
    addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    // If type or color skins arrive late the line color changes, so draw once more
    document.fonts?.ready.then(draw);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      canvas.remove();
    };
  });
})();
