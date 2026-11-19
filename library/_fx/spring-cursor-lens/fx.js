(() => {
  // Rotates the size with the same integration as react-spring (1ms steps, tension·friction·mass 1) — the original cursor shrinks by that value,
  // Changing to a GSAP curve changes the wobble when standing over a target. The spot follows the mouse directly with no delay.
  // Within edge px of the window edge, the circle slides out past the nearest edge, and when it comes back in it slides in from that side (slide seconds, chosen easing)
  const springStep = (s, dt) => {
    for (let i = 0; i < dt; i++) {
      s.v += (-s.tension * 1e-6 * (s.x - s.to) - s.friction * 1e-3 * s.v);
      const next = s.x + s.v;
      if (s.clamp && (next - s.to) * (s.x - s.to) < 0) { s.x = s.to; s.v = 0; break; }
      s.x = next;
    }
    if (Math.abs(s.v) < 1e-5 && Math.abs(s.x - s.to) < 1e-4) { s.x = s.to; s.v = 0; }
    return s.v !== 0 || s.x !== s.to;
  };

  kfFx.register("spring-cursor-lens", (el, { options, reduce, hover }) => {
    if (!hover) return;
    let lens = el.querySelector('[data-fx-part="lens"]'), made = false;
    if (!lens) { lens = document.createElement("span"); lens.dataset.fxPart = "lens"; el.append(lens); made = true; }
    const pick = options.target || "a, button, [data-clickable]";
    const small = +(options.small ?? 0.5), down = +(options.down ?? 0.9);
    const edge = +(options.edge ?? 10), slide = reduce ? 0 : +(options.slide ?? 0.15) * 1000;
    const hide = options.native !== "show";
    const scale = { x: 1, to: 1, v: 0, tension: +(options.tension ?? 150.93265), friction: +(options.friction ?? 19.56007), clamp: true };
    const press = { x: 1, to: 1, v: 0, tension: +(options["down-tension"] ?? 129.69176), friction: +(options["down-friction"] ?? 8.24223), clamp: false };
    const off = { x: 0, y: 0, fx: 0, fy: 0, tx: 0, ty: 0, t0: 0 };
    let mx = -100, my = -100, raf = 0, last = 0, out = true;
    const half = () => el.offsetWidth / 2;
    const paint = () => {
      el.style.transform = `translate3d(${mx + off.x}px, ${my + off.y}px, 0)`;
      lens.style.transform = `scale(${scale.x * press.x})`;
    };
    const slideStep = (now) => {
      if (off.t0 === 0) return false;
      const k = slide ? Math.min(1, (now - off.t0) / slide) : 1;
      off.x = off.fx + (off.tx - off.fx) * k;
      off.y = off.fy + (off.ty - off.fy) * k;
      if (k === 1) off.t0 = 0;
      return k < 1;
    };
    const tick = (now) => {
      const dt = Math.min(64, Math.max(1, Math.round(now - (last || now - 16))));
      last = now;
      const a = springStep(scale, dt), b = springStep(press, dt), c = slideStep(now);
      paint();
      raf = a || b || c ? requestAnimationFrame(tick) : 0;
      if (!raf) last = 0;
    };
    const kick = () => {
      if (reduce) { scale.x = scale.to; press.x = press.to; scale.v = press.v = 0; off.x = off.tx; off.y = off.ty; off.t0 = 0; paint(); return; }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    // Spot beyond the nearest window edge (one more circle radius out) — where the original cursor leaves the window
    const exitOffset = () => {
      const d = { left: mx, right: innerWidth - mx, top: my, bottom: innerHeight - my };
      const side = Object.keys(d).reduce((a, b) => (d[a] <= d[b] ? a : b));
      const r = half();
      if (side === "left") return { x: -d.left - r, y: 0 };
      if (side === "right") return { x: d.right + r, y: 0 };
      if (side === "top") return { x: 0, y: -d.top - r };
      return { x: 0, y: d.bottom + r };
    };
    const slideTo = (tx, ty, from) => {
      off.fx = from ? from.x : off.x; off.fy = from ? from.y : off.y;
      off.tx = tx; off.ty = ty; off.t0 = performance.now();
      kick();
    };
    const nearEdge = () => mx < edge || my < edge || mx > innerWidth - edge || my > innerHeight - edge;
    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      el.classList.add("is-on");
      if (nearEdge()) { if (!out) { out = true; const o = exitOffset(); slideTo(o.x, o.y); } }
      else if (out) { out = false; slideTo(0, 0, off.t0 || off.x || off.y ? null : exitOffset()); }
      const on = !!(e.target instanceof Element && e.target.closest(pick));
      const to = on ? small : 1;
      if (to !== scale.to) { scale.to = to; kick(); }
      if (!raf) paint();
    };
    const onDown = () => { press.to = down; kick(); };
    const onUp = () => { press.to = 1; kick(); };
    const onLeave = () => { if (!out) { out = true; const o = exitOffset(); slideTo(o.x, o.y); } };
    // When the window loses focus, hide the circle like the original — on the next movement it slides back in again from the end side.
    const onBlur = () => { out = true; el.classList.remove("is-on"); };
    if (hide) document.documentElement.classList.add("fx-cursor-hidden");
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", onDown);
    addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);
    addEventListener("blur", onBlur);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      removeEventListener("blur", onBlur);
      const others = [...document.querySelectorAll('[data-fx~="spring-cursor-lens"]')].some((n) => n !== el);
      if (hide && !others) document.documentElement.classList.remove("fx-cursor-hidden");
      el.classList.remove("is-on");
      el.style.transform = "";
      if (made) lens.remove(); else lens.style.transform = "";
    };
  });
})();
