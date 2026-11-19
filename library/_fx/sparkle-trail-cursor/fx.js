(() => {
  // A four-point star follows the cursor by .2 of the remaining distance each frame, and while moving, every 50ms (when moved over 2px) one tail star appears 0~25px behind the cursor.
  // Tail stars are rotated ±360° at 20~30·30~40·40~50px (30·40·30%) and scatter more slowly the larger they are (slightly downward). Over .8s they reach .8 by 60%, vanish at 77%, and shrink by a factor of 1−1.2t (not stopped at 0 as in the original, so at the end they flip and grow). Max 10.
  kfFx.register("sparkle-trail-cursor", (el, { options, reduce, hover }) => {
    const minW = +(options["min-width"] ?? 769) || 769;
    if (reduce || !hover || innerWidth < minW) return;
    const life = +(options.life ?? 0.8) * 1000 || 800, every = +(options.every ?? 50), max = +(options.max ?? 10) || 10, follow = +(options.follow ?? 0.2) || 0.2;
    const whole = el === document.body || el === document.documentElement;
    const star = (cls) => { const d = document.createElement("div"); d.className = cls; d.innerHTML = "<i></i>"; document.body.append(d); return d; };
    const tracker = star("fx-stc-tracker");
    tracker.hidden = true;
    let tx = innerWidth / 2, ty = innerHeight / 2, cx = tx, cy = ty, lx = tx, ly = ty, last = 0, inside = whole;
    const parts = [];
    const onMove = (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!whole) { const r = el.getBoundingClientRect(); inside = tx >= r.left && tx <= r.right && ty >= r.top && ty <= r.bottom; }
      if (tracker.hidden && inside) { cx = tx; cy = ty; }
      tracker.hidden = !inside;
      const now = performance.now();
      if (!inside || Math.hypot(tx - lx, ty - ly) < 2 || now - last < every) return;
      last = now;
      if (parts.length >= max) parts.shift().el.remove();
      const r = Math.random();
      const size = r < 0.3 ? 20 + Math.random() * 10 : r < 0.7 ? 30 + Math.random() * 10 : 40 + Math.random() * 10;
      const ang = Math.atan2(ty - ly, tx - lx), dist = Math.random() * 25;
      const p = star("fx-stc-particle");
      const sp = 2 * (1 - (size - 15) / 30);
      const part = { el: p, born: now, x: tx + Math.cos(ang) * dist, y: ty + Math.sin(ang) * dist, rot: Math.random() * 720 - 360, vx: (Math.random() - 0.5) * sp, vy: (Math.random() - 0.5) * sp + 0.4 };
      // Like the original, at creation it’s already .8 · own angle · own place — so no pop from 1 → .8 on the first frame
      Object.assign(p.style, { width: `${size}px`, height: `${size}px`, opacity: "0.8", left: `${part.x}px`, top: `${part.y}px`, transform: `translate(-50%,-50%) rotate(${part.rot}deg)` });
      parts.push(part);
      lx = tx; ly = ty;
    };
    const tick = () => {
      cx += (tx - cx) * follow;
      cy += (ty - cy) * follow;
      tracker.style.left = `${cx}px`;
      tracker.style.top = `${cy}px`;
      const now = performance.now();
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        const k = (now - p.born) / life;
        if (k >= 1) { p.el.remove(); parts.splice(i, 1); continue; }
        p.x += p.vx; p.y += p.vy;
        p.el.style.left = `${p.x}px`;
        p.el.style.top = `${p.y}px`;
        p.el.style.opacity = k < 0.6 ? 0.8 : k < 0.85 ? Math.max(0, 0.8 * (1 - ((k - 0.6) / 0.25) * 1.5)) : 0;
        p.el.style.transform = `translate(-50%,-50%) scale(${1 - k * 1.2}) rotate(${p.rot}deg)`;
      }
    };
    addEventListener("mousemove", onMove);
    const useGsap = !!window.gsap;
    let raf = 0;
    const loop = () => { tick(); raf = requestAnimationFrame(loop); };
    if (useGsap) gsap.ticker.add(tick); else raf = requestAnimationFrame(loop);
    return () => {
      removeEventListener("mousemove", onMove);
      if (useGsap) gsap.ticker.remove(tick); else cancelAnimationFrame(raf);
      tracker.remove();
      parts.forEach((p) => p.el.remove());
    };
  });
})();
