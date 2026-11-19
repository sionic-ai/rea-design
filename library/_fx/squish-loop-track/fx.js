// Wheel and drag push the target position (target), and the visible position (cur) follows with exponential easing corrected by frame time — it scrolls at the same speed even when not at 60fps
(() => {
  kfFx.register("squish-loop-track", (el, { options, reduce }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const parts = items.map((it) => it.querySelector('[data-fx-part="squish"]') || it);
    const lerp = +(options.lerp ?? 0.06) || 0.06;
    const wheelK = +(options.wheel ?? 2);
    const fling = +(options.fling ?? 0.3);
    const squish = reduce ? 0 : +(options.squish ?? 0.002);
    const maxV = +(options.max ?? 100) || 100;
    const setX = items.map((it) => gsap.quickSetter(it, "x", "px"));
    let step = 0, total = 0, wrap = (v) => v;
    const measure = () => {
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      const w = items[0].getBoundingClientRect().width / (gsap.getProperty(items[0], "scale") || 1);
      step = w + gap;
      total = step * items.length;
      wrap = gsap.utils.wrap(-step, total - step);
    };
    let target = 0, cur = 0, prev = 0, scale = 1, last = 0;
    const place = () => items.forEach((it, i) => setX[i](wrap(i * step - cur) - i * step));
    const follow = (k, n) => 1 - Math.pow(1 - k, n);
    const tick = (time, dt) => {
      const n = Math.min(4, Math.max(0.25, (dt > 0 ? dt : 16.67) / 16.67));
      const d = target - cur;
      cur = reduce || Math.abs(d) <= 0.01 ? target : cur + d * follow(lerp, n);
      const v = (cur - prev) / n;
      const moved = cur !== prev;
      prev = cur;
      if (squish) {
        const goal = 1 - Math.min(maxV, Math.abs(v)) * squish;
        scale += (goal - scale) * follow(lerp, n);
        if (goal === 1 && Math.abs(1 - scale) <= 1e-4) scale = 1;
        if (scale !== last) { parts.forEach((p) => (scale === 1 ? gsap.set(p, { clearProps: "scale" }) : gsap.set(p, { scale }))); last = scale; }
      }
      if (moved) { place(); el.dispatchEvent(new CustomEvent("fx:move", { detail: { x: cur } })); }
    };
    const onWheel = (e) => {
      if (!wheelK) return;
      e.preventDefault();
      target += (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * wheelK;
    };
    // Drag — pulls the target by the horizontal distance moved, and on release pushes further by the last speed (px/s) × fling
    let drag = null;
    const down = (e) => {
      if (e.button > 0) return;
      drag = { x: e.clientX, y: e.clientY, t: performance.now(), vx: 0, moved: false, id: e.pointerId };
    };
    const move = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x, now = performance.now();
      if (!drag.moved && Math.abs(dx) < 4) return;
      if (!drag.moved && e.pointerType === "touch" && Math.abs(e.clientY - drag.y) > Math.abs(dx)) { drag = null; return; }
      drag.moved = true;
      el.classList.add("fx-squish-dragging");
      target -= dx;
      drag.vx = (dx / Math.max(1, now - drag.t)) * 1000;
      drag.x = e.clientX; drag.t = now;
    };
    const up = () => {
      if (!drag) return;
      if (drag.moved) { target -= drag.vx * fling; el.addEventListener("click", stopClick, { capture: true, once: true }); setTimeout(() => el.removeEventListener("click", stopClick, true), 0); }
      drag = null;
      el.classList.remove("fx-squish-dragging");
    };
    const stopClick = (e) => { e.preventDefault(); e.stopPropagation(); };
    const ro = new ResizeObserver(() => { measure(); place(); });
    measure();
    place();
    ro.observe(el);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", down);
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    addEventListener("pointercancel", up);
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", down);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      removeEventListener("pointercancel", up);
      el.classList.remove("fx-squish-dragging");
      if (el.isConnected) gsap.set([...items, ...parts], { clearProps: "x,scale,transform" });
    };
  });
})();
