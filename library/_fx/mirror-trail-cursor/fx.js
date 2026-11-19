(() => {
  // On the panel a small square follows the cursor late leaving a tail line, and a mirrored pair of square and tail moves together on the opposite side, flipped around the panel center.
  // The tail is a curve smoothed evenly three times over the last 30 points, and points within 14px of the head aren’t drawn so the square and line don’t touch
  kfFx.register("mirror-trail-cursor", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const lag = +(options.lag ?? 0.45);
    const ease = kfFx.ease(options.ease || "power3.out", "power3.out");
    const keep = Number(options.points) || 30;
    const gapHead = +(options.gap ?? 14);
    const width = Number(options.line) || 2;
    const mirror = options.mirror !== "off";

    const layer = document.createElement("div");
    layer.className = "fx-mtc-layer";
    layer.setAttribute("aria-hidden", "true");
    const canvas = document.createElement("canvas");
    const dotA = document.createElement("i");
    const dotB = document.createElement("i");
    dotA.className = dotB.className = "fx-mtc-dot";
    layer.append(canvas, dotA);
    if (mirror) layer.append(dotB);
    el.append(layer);
    const ctx = canvas.getContext("2d");
    if (!ctx) { layer.remove(); return; }

    const box = { w: 0, h: 0, active: false };
    const size = () => {
      const dpr = Math.max(1, devicePixelRatio || 1);
      const r = layer.getBoundingClientRect();
      box.w = r.width; box.h = r.height;
      canvas.width = box.w * dpr; canvas.height = box.h * dpr;
      canvas.style.width = `${box.w}px`; canvas.style.height = `${box.h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(layer);

    const p = { x: box.w / 2, y: box.h / 2 };
    const toX = gsap.quickTo(p, "x", { duration: lag, ease });
    const toY = gsap.quickTo(p, "y", { duration: lag, ease });
    const trail = [];
    const onMove = (e) => {
      const r = layer.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > box.w || y > box.h) { box.active = false; return; }
      box.active = true;
      toX(x); toY(y);
    };
    const onLeave = () => { box.active = false; };

    const stroke = (color) => {
      let cut = trail.length;
      for (let i = trail.length - 1; i >= 0; i--) {
        if (Math.hypot(trail[i].x - p.x, trail[i].y - p.y) > gapHead) { cut = i + 1; break; }
      }
      let pts = trail.slice(0, cut);
      if (pts.length < 4) return;
      for (let k = 0; k < 3; k++) {
        pts = pts.map((q, i) => (i === 0 || i === pts.length - 1 ? q : { x: (pts[i - 1].x + 2 * q.x + pts[i + 1].x) / 4, y: (pts[i - 1].y + 2 * q.y + pts[i + 1].y) / 4 }));
      }
      ctx.lineWidth = width;
      ctx.lineCap = "butt";
      ctx.lineJoin = "round";
      ctx.strokeStyle = color;
      for (let i = 1; i < pts.length - 2; i++) {
        const a = pts[i - 1], b = pts[i], c = pts[i + 1], d = pts[i + 2];
        ctx.globalAlpha = i / pts.length;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.bezierCurveTo(b.x + (c.x - a.x) / 6, b.y + (c.y - a.y) / 6, c.x - (d.x - b.x) / 6, c.y - (d.y - b.y) / 6, c.x, c.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };
    const tick = () => {
      if (!box.active && trail.length === 0) return;
      if (box.active) { trail.push({ x: p.x, y: p.y }); if (trail.length > keep) trail.shift(); } else trail.shift();
      dotA.style.left = `${p.x}px`; dotA.style.top = `${p.y}px`;
      dotB.style.left = `${box.w - p.x}px`; dotB.style.top = `${box.h - p.y}px`;
      dotA.style.opacity = dotB.style.opacity = box.active ? "1" : "0";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const color = getComputedStyle(dotA).backgroundColor;
      stroke(color);
      if (mirror) {
        ctx.save();
        ctx.translate(box.w / 2, box.h / 2);
        ctx.scale(-1, -1);
        ctx.translate(-box.w / 2, -box.h / 2);
        stroke(color);
        ctx.restore();
      }
    };
    gsap.ticker.add(tick);
    addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      gsap.ticker.remove(tick);
      removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      ro.disconnect();
      layer.remove();
    };
  });
})();
