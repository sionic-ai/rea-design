// Draws the last 900ms of cursor path as an ink line on a screen-fixed canvas — a node is stamped only when the cursor moves over 2px, and the width thins from 3.2 → .9px by speed (px/ms ÷ 2.4)
// Follows the previous node by .35 each. Per node, with remaining life s, opacity 1−s², width ×(.55 + .45·opacity). The line is white difference, so it appears inverted on any background
(() => {
  kfFx.register("ink-trail-cursor", (root, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const life = +(options.life ?? 900), max = +(options.max ?? 3.2), min = +(options.min ?? 0.9);
    const cv = document.createElement("canvas");
    cv.className = "fx-ink-trail";
    cv.setAttribute("aria-hidden", "true");
    document.body.append(cv);
    const c = cv.getContext("2d");
    let pts = [], raf = 0, W = 0, H = 0;
    const size = () => { const r = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = Math.round(W * r); cv.height = Math.round(H * r); c.setTransform(r, 0, 0, r, 0, 0); };
    size();
    const draw = () => {
      const now = performance.now();
      pts = pts.filter((p) => now - p.t < life);
      c.clearRect(0, 0, W, H);
      c.lineCap = "round"; c.lineJoin = "round";
      c.strokeStyle = "#fff"; /* Not Skin: a difference blend needs a white line so it inverts visibly on any background */
      for (let i = 1; i < pts.length - 1; i++) {
        const a = pts[i - 1], p = pts[i], n = pts[i + 1], s = (now - p.t) / life, k = 1 - s * s;
        c.globalAlpha = Math.max(0, k);
        c.lineWidth = p.w * (0.55 + 0.45 * k);
        c.beginPath(); c.moveTo((a.x + p.x) / 2, (a.y + p.y) / 2); c.quadraticCurveTo(p.x, p.y, (p.x + n.x) / 2, (p.y + n.y) / 2); c.stroke();
      }
      c.globalAlpha = 1;
      raf = pts.length ? requestAnimationFrame(draw) : 0;
    };
    const move = (e) => {
      if (e.pointerType === "touch") return;
      const prev = pts[pts.length - 1], now = performance.now();
      if (prev) {
        const d = Math.hypot(e.clientX - prev.x, e.clientY - prev.y);
        if (d < 2) return;
        const w = max - (max - min) * Math.min(1, d / Math.max(1, now - prev.t) / 2.4);
        pts.push({ t: now, w: prev.w + (w - prev.w) * 0.35, x: e.clientX, y: e.clientY });
      } else pts.push({ t: now, w: max, x: e.clientX, y: e.clientY });
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const clear = () => (pts = []);
    root.addEventListener("pointermove", move, { passive: true });
    root.addEventListener("pointerleave", clear);
    addEventListener("resize", size);
    return () => { cancelAnimationFrame(raf); root.removeEventListener("pointermove", move); root.removeEventListener("pointerleave", clear); removeEventListener("resize", size); cv.remove(); };
  });
})();
