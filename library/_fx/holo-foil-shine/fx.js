// The gold gradient end point and gloss center shift a little each frame toward the cursor (a sine sway if there is none).
(() => {
  kfFx.register("holo-foil-shine", (el, { options, reduce, hover }) => {
    const svg = el.querySelector("svg");
    const foil = el.querySelector("[data-fx-part=foil]"), shine = el.querySelector("[data-fx-part=shine]");
    if (!svg || (!foil && !shine) || reduce) return;
    const vb = (svg.getAttribute("viewBox") || "0 0 100 100").split(/[\s,]+/).map(Number);
    const W = vb[2] || 100, H = vb[3] || 100, follow = +(options.follow ?? 0.08), travel = +(options.travel ?? 0.9);
    const m = { x: 0, y: 0, on: false };
    let x = 0.5, y = 0.5, seen = false, raf = 0;
    const move = (e) => { if (e.pointerType === "mouse") { m.x = e.clientX; m.y = e.clientY; m.on = true; } };
    if (hover) addEventListener("pointermove", move, { passive: true });
    const tick = (t) => {
      raf = requestAnimationFrame(tick);
      if (!seen) return;
      const r = el.getBoundingClientRect();
      let tx, ty;
      if (m.on && r.width) { tx = Math.min(1.5, Math.max(-0.5, (m.x - r.left) / r.width)); ty = Math.min(1.5, Math.max(-0.5, (m.y - r.top) / r.height)); }
      else { tx = 0.5 + Math.sin(t / 1600 + r.left / 200) * 0.6; ty = 0.5 + Math.cos(t / 2100 + r.top / 200) * 0.6; }
      x += (tx - x) * follow; y += (ty - y) * follow;
      const sx = (x - 0.5) * W * travel, sy = (y - 0.5) * H * travel;
      if (foil) { foil.setAttribute("x1", String(-sx)); foil.setAttribute("y1", String(-sy)); foil.setAttribute("x2", String(W * 0.6 - sx)); foil.setAttribute("y2", String(H * 0.6 - sy)); }
      if (shine) { shine.setAttribute("cx", String(x * W)); shine.setAttribute("cy", String(y * H)); }
    };
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting));
    io.observe(el);
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener("pointermove", move); };
  });
})();
