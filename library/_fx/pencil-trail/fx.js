// Leaves short pencil marks (4px) every 11px along the mouse path, and the marks fade over .9s with opacity .7·v².
// Marks lie along the direction of movement and land (6, 14)px below and right of the cursor tip, so they feel like they trail a pencil tip
(() => {
  kfFx.register("pencil-trail", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const LIFE = +options.life || 900, GAP = +options.gap || 11, LEN = +(options.len ?? 4), OX = +(options.ox ?? 6), OY = +(options.oy ?? 14);
    const cv = document.createElement("canvas");
    cv.className = "fx-pencil-trail";
    cv.setAttribute("aria-hidden", "true");
    document.body.append(cv);
    const ctx = cv.getContext("2d");
    const ink = getComputedStyle(cv).color;
    const marks = [];
    let last = null, carry = 0, dpr = 1, running = false, raf = 0;
    const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; };
    size();
    const frame = (now) => {
      while (marks.length && now - marks[0].t > LIFE) marks.shift();
      ctx.clearRect(0, 0, cv.width, cv.height);
      if (!marks.length) { running = false; return; }
      ctx.lineCap = "round";
      ctx.lineWidth = 1.6 * dpr;
      ctx.strokeStyle = ink;
      for (const m of marks) {
        const v = 1 - (now - m.t) / LIFE;
        ctx.globalAlpha = Math.max(0, 0.7 * v * v);
        const cx = Math.cos(m.a) * (LEN / 2) * dpr, cy = Math.sin(m.a) * (LEN / 2) * dpr;
        ctx.beginPath();
        ctx.moveTo(m.x * dpr - cx, m.y * dpr - cy);
        ctx.lineTo(m.x * dpr + cx, m.y * dpr + cy);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    const move = (e) => {
      if (e.pointerType !== "mouse") return;
      const p = { x: e.clientX + OX, y: e.clientY + OY };
      if (!last) { last = p; return; }
      const dx = p.x - last.x, dy = p.y - last.y, d = Math.hypot(dx, dy);
      if (d > 200) { last = p; carry = 0; return; }
      const a = Math.atan2(dy, dx), now = performance.now();
      for (carry += d; carry >= GAP;) {
        carry -= GAP;
        const k = carry / (d || 1);
        marks.push({ x: p.x - dx * k, y: p.y - dy * k, a, t: now });
      }
      last = p;
      if (!running) { running = true; raf = requestAnimationFrame(frame); }
    };
    const leave = () => { last = null; };
    el.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerleave", leave);
    addEventListener("resize", size);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      removeEventListener("resize", size);
      cv.remove();
    };
  });
})();
