(() => {
  // When the board enters the screen at its leading edge in scroll direction, it first sits once in a thrown spot (side 3.5% · top 11% · 1.07x · −.035rad), then
  // Settles into place on a spring (pull 120 · damping 11.6, in seconds) — like turning a card on a table. Re-arms once it fully leaves the screen (±10%).
  // Looks along x for a horizontal reel (a scroll panel overflowing horizontally), otherwise along y. One part per panel, and all orbiting rings share one
  const K = 120, items = new Set();
  let raf = 0, last = 0;
  const loop = (now) => {
    raf = 0;
    const dt = Math.min(0.05, Math.max(0.001, (now - (last || now)) / 1000)) || 1 / 60;
    last = now;
    for (const it of items) it.step(dt);
    if (items.size) raf = requestAnimationFrame(loop);
  };
  const start = () => { if (!raf) { last = 0; raf = requestAnimationFrame(loop); } };

  kfFx.register("deal-spring-in", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    const target = el.querySelector('[data-fx-part="swing"]') || el;
    const damp = +(options.damp ?? 11.6), pull = +(options.pull ?? K);
    const dx = +(options.x ?? 0.035), dy = +(options.y ?? 0.11), dyv = +(options["y-vertical"] ?? 0.09), ds = +(options.scale ?? 0.07), dr = +(options.rotate ?? 0.035);
    const steady = options.steady === "1" || options.steady === "true";
    const box = scroller || null;
    const axisX = () => (options.axis ? options.axis === "x" : !!box && box.scrollWidth > box.clientWidth + 1);
    // If the scroll panel does not overflow vertically either (the panel is released into document flow on narrow screens), watch the window scroll
    const pos = () => (box && axisX() ? box.scrollLeft : box && box.scrollHeight > box.clientHeight + 1 && getComputedStyle(box).overflowY !== "visible" ? box.scrollTop : scrollY);
    const ch = { x: { v: 0, w: 0 }, y: { v: 0, w: 0 }, s: { v: 0, w: 0 }, r: { v: 0, w: 0 } };
    let armed = true, dir = 1, prev = pos(), moving = false;
    const deal = (horiz) => {
      const H = innerHeight, W = innerWidth;
      ch.y.v = horiz ? -H * dy : dir * H * dyv;
      ch.x.v = horiz ? dir * W * dx : 0;
      ch.s.v = ds;
      ch.r.v = steady && !horiz ? 0 : -dir * dr;
      for (const c of Object.values(ch)) c.w = 0;
      moving = true;
    };
    const it = {
      step(dt) {
        const p = pos();
        if (p !== prev) { dir = p > prev ? 1 : -1; prev = p; }
        const horiz = axisX();
        const b = el.getBoundingClientRect(), W = innerWidth, H = innerHeight;
        const away = horiz ? b.right < -W * 0.1 || b.left > W * 1.1 : b.bottom < -H * 0.1 || b.top > H * 1.1;
        if (away) {
          armed = true;
          if (moving) { for (const c of Object.values(ch)) c.v = c.w = 0; target.style.transform = ""; moving = false; }
          return;
        }
        const lead = horiz ? (dir > 0 ? b.left < W * 0.97 : b.right > W * 0.03) : dir > 0 ? b.top < H * 1.04 && b.bottom > H : b.bottom > -H * 0.04 && b.top < 0;
        if (armed && lead) { armed = false; deal(horiz); }
        if (!moving) return;
        let live = false;
        for (const c of Object.values(ch)) {
          c.w += (-pull * c.v - damp * c.w) * dt;
          c.v += c.w * dt;
          if (Math.abs(c.v) < 1e-4 && Math.abs(c.w) < 0.001) { c.v = 0; c.w = 0; } else live = true;
        }
        const s = steady && !horiz ? Math.max(0, ch.s.v) : ch.s.v;
        target.style.transform = live ? `translate3d(${ch.x.v.toFixed(2)}px, ${ch.y.v.toFixed(2)}px, 0) rotate(${ch.r.v.toFixed(4)}rad) scale(${(1 + s).toFixed(4)})` : "";
        moving = live;
      },
    };
    // Slabs already on screen at first open are not thrown
    const b0 = el.getBoundingClientRect();
    if (b0.right > 0 && b0.left < innerWidth && b0.bottom > 0 && b0.top < innerHeight) armed = false;
    items.add(it);
    start();
    return () => { items.delete(it); target.style.transform = ""; };
  });
})();
