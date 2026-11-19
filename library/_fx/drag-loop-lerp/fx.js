// Endless drag photo row — the target accumulates power times the distance the hand pushed, and each frame the row follows accel of the gap to the target (inertial glide).
// Cells wrap by the row width (modulo), so passing the left edge they stand again at the right edge. If moved vertically more than 10px, the drag is released so page scroll isn’t blocked.
(() => {
  kfFx.register("drag-loop-lerp", (el, { options, reduce, hover }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const power = +(options.power ?? 2.5), accel = +(options.accel ?? 0.1), follow = +(options.follow ?? 0.2);
    const disc = el.querySelector('[data-fx-part="disc"]');
    let cells = [], wrap = 0, x = 0, target = 0;
    const measure = () => {
      let sum = 0;
      cells = items.map((item) => { const w = item.offsetWidth; sum += w; return { item, w, pos: sum }; });
      wrap = sum;
    };
    const place = () => {
      if (!wrap) return;
      for (const c of cells) {
        const p = c.pos + x;
        gsap.set(c.item, { x: (((p % wrap) + wrap) % wrap) - c.w });
      }
    };
    measure();
    place();
    const ro = new ResizeObserver(() => { measure(); place(); });
    items.forEach((i) => ro.observe(i));
    if (reduce) return () => { ro.disconnect(); gsap.set(items, { clearProps: "transform" }); };

    let dragging = false, sx = 0, sy = 0;
    const pt = (e) => (e.touches ? e.touches[0] : e);
    const down = (e) => {
      dragging = true;
      sx = pt(e).clientX; sy = pt(e).clientY;
      el.classList.add("is-dragging");
      el.dispatchEvent(new CustomEvent("fx:drag", { bubbles: true, detail: { on: true } }));
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("is-dragging");
      el.dispatchEvent(new CustomEvent("fx:drag", { bubbles: true, detail: { on: false } }));
    };
    const move = (e) => {
      if (!dragging) return;
      const cx = pt(e).clientX, cy = pt(e).clientY;
      if (Math.abs(cy - sy) > 10) return up();
      target += (cx - sx) * power;
      sx = cx; sy = cy;
    };

    // Guide circle — fixed to the screen, follows the cursor by the follow amount each frame
    let mx = innerWidth / 2, my = innerHeight / 2, dx = mx, dy = my;
    const track = (e) => { mx = e.clientX; my = e.clientY; };
    const enter = () => disc?.classList.add("is-on");
    const leave = () => { disc?.classList.remove("is-on"); up(); };

    const tick = () => {
      x += (target - x) * accel;
      place();
      if (disc && hover) {
        dx += (mx - dx) * follow;
        dy += (my - dy) * follow;
        disc.style.transform = `translate(${dx}px, ${dy}px)`;
      }
    };
    gsap.ticker.add(tick);
    const passive = { passive: true };
    el.addEventListener("touchstart", down, passive);
    el.addEventListener("touchmove", move, passive);
    el.addEventListener("touchend", up, passive);
    el.addEventListener("mousedown", down);
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseup", up);
    el.addEventListener("mouseleave", leave);
    el.addEventListener("mouseenter", enter);
    addEventListener("mousemove", track, passive);

    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      el.removeEventListener("touchstart", down, passive);
      el.removeEventListener("touchmove", move, passive);
      el.removeEventListener("touchend", up, passive);
      el.removeEventListener("mousedown", down);
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseup", up);
      el.removeEventListener("mouseleave", leave);
      el.removeEventListener("mouseenter", enter);
      removeEventListener("mousemove", track, passive);
      el.classList.remove("is-dragging");
      disc?.classList.remove("is-on");
      if (disc) disc.style.transform = "";
      gsap.set(items, { clearProps: "transform" });
    };
  });
})();
