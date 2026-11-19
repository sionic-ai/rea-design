(() => {
  // Original (drag head of an evidence board on a band site): while dragging, the board follows the hand exactly and its velocity catches up by 1 − e^(−25·dt).
  // On release it glides at that speed and cools by e^(−5·dt), and if the remaining distance to the panel end is within the edge width (.75 / screen width 7.46 ≈ .1), it slows by that much and sticks at the end.
  // Moving more than 2% of screen width counts as a drag — anything below stays a press (pressing the proof inside)
  kfFx.register("drag-pan-inertia", (el, { options, reduce }) => {
    const plane = el.querySelector(':scope > [data-fx-part="plane"]');
    if (!plane) return;
    const smooth = +(options.smoothing ?? 25), friction = +(options.friction ?? 5), edgeK = +(options.edge ?? 0.1), speed = +(options.speed ?? 1);
    const threshold = +(options.threshold ?? 0.02);
    const pos = { x: 0, y: 0 }, vel = { x: 0, y: 0 }, delta = { x: 0, y: 0 };
    const lim = { x: 0, y: 0 };
    let down = false, dragging = false, moved = false, first = { x: 0, y: 0 }, last = { x: 0, y: 0 };
    const measure = () => {
      lim.x = Math.max(0, (plane.offsetWidth - el.clientWidth) / 2);
      lim.y = Math.max(0, (plane.offsetHeight - el.clientHeight) / 2);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el); ro.observe(plane);
    const damp = (axis, sign) => {
      const edge = edgeK * el.clientWidth;
      if (edge <= 0 || sign === 0) return 1;
      const room = sign > 0 ? lim[axis] - pos[axis] : pos[axis] + lim[axis];
      return Math.min(1, Math.max(0, room / edge));
    };
    const apply = () => gsap.set(plane, { x: -pos.x, y: -pos.y });
    const tick = (time, dtMs) => {
      const dt = Math.min(50, Math.max(1, dtMs)) / 1000;
      if (dragging) {
        const fx = damp("x", Math.sign(delta.x)), fy = damp("y", Math.sign(delta.y));
        pos.x += delta.x * speed * fx; pos.y += delta.y * speed * fy;
        const k = 1 - Math.exp(-smooth * dt);
        vel.x += (delta.x * speed / dt * fx - vel.x) * k;
        vel.y += (delta.y * speed / dt * fy - vel.y) * k;
      } else if (vel.x || vel.y) {
        pos.x += vel.x * damp("x", Math.sign(vel.x)) * dt;
        pos.y += vel.y * damp("y", Math.sign(vel.y)) * dt;
        const f = Math.exp(-friction * dt);
        vel.x *= f; vel.y *= f;
        if (vel.x * vel.x + vel.y * vel.y < 1e-2) vel.x = vel.y = 0;
      }
      for (const a of ["x", "y"]) {
        const c = Math.min(lim[a], Math.max(-lim[a], pos[a]));
        if (c !== pos[a]) { pos[a] = c; vel[a] = 0; }
      }
      delta.x = delta.y = 0;
      apply();
    };
    const onDown = (e) => {
      if (e.button > 0) return;
      down = true; moved = false;
      first = { x: e.clientX, y: e.clientY }; last = { ...first };
      vel.x = vel.y = 0;
    };
    const onMove = (e) => {
      if (!down) return;
      const dx = e.clientX - last.x, dy = e.clientY - last.y;
      last = { x: e.clientX, y: e.clientY };
      if (!dragging && Math.hypot((e.clientX - first.x) / el.clientWidth, (e.clientY - first.y) / el.clientHeight) > threshold) {
        dragging = moved = true; el.classList.add("is-dragging");
      }
      if (dragging) { delta.x -= dx; delta.y -= dy; }
    };
    const onUp = () => { if (!down) return; down = false; dragging = false; el.classList.remove("is-dragging"); };
    // The press produced when letting go after a drag must not reach the links or evidence inside
    const onClick = (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } };
    if (reduce) {
      // With reduced motion, follow the hand with no inertia
      el.addEventListener("pointerdown", onDown);
      const plain = (e) => { onMove(e); if (dragging) { pos.x = Math.min(lim.x, Math.max(-lim.x, pos.x + delta.x)); pos.y = Math.min(lim.y, Math.max(-lim.y, pos.y + delta.y)); delta.x = delta.y = 0; apply(); } };
      addEventListener("pointermove", plain);
      addEventListener("pointerup", onUp);
      el.addEventListener("click", onClick, true);
      return () => { ro.disconnect(); el.removeEventListener("pointerdown", onDown); removeEventListener("pointermove", plain); removeEventListener("pointerup", onUp); el.removeEventListener("click", onClick, true); gsap.set(plane, { clearProps: "transform" }); };
    }
    el.addEventListener("pointerdown", onDown);
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerup", onUp);
    addEventListener("pointercancel", onUp);
    el.addEventListener("click", onClick, true);
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      el.removeEventListener("pointerdown", onDown);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", onClick, true);
      el.classList.remove("is-dragging");
      gsap.set(plane, { clearProps: "transform" });
    };
  });
})();
