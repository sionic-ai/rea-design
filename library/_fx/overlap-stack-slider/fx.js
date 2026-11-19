(() => {
  // Drag a horizontal row of cards and passed cards stay stacked at the left end, shrinking scale 1→.45 and rotating 0→−8° as they pass one card width (pivot at 75% center).
  // On release it glides with inertia (max 1s) and snaps to the nearest card. One Draggable instead of arrows · dots — without InertiaPlugin it just snaps with no inertia
  kfFx.register("overlap-stack-slider", (el, { options, reduce }) => {
    const list = el.querySelector('[data-fx-part="list"]');
    const items = list ? [...list.querySelectorAll('[data-fx-part="item"]')] : [];
    if (!list || !items.length || !window.Draggable) return;
    const scaleTo = +(options.scale ?? 0.45), rot = +(options.rotate ?? -8), maxDur = +(options.dur ?? 1);
    let step = 0, max = 0, u = 0;
    const clamp = (v) => (max <= 0 ? 0 : Math.min(Math.max(v, 0), max));
    const draw = () => {
      gsap.set(list, { x: -u });
      items.forEach((it, r) => { const o = Math.max(0, u - r * step), a = step > 0 ? Math.min(o / step, 1) : 0; gsap.set(it, { x: o, scale: 1 - (1 - scaleTo) * a, rotation: rot * a, transformOrigin: "75% center" }); });
    };
    let drag = null;
    const measure = () => {
      const mr = parseFloat(getComputedStyle(items[0]).marginRight) || 0, gap = parseFloat(getComputedStyle(list).columnGap) || 0;
      step = items[0].offsetWidth + mr + gap; max = step * (items.length - 1); u = clamp(u); draw();
      drag && drag.applyBounds({ minX: -max, maxX: 0 });
    };
    el.style.touchAction = "pan-y"; el.style.userSelect = "none";
    drag = Draggable.create(list, {
      type: "x", bounds: { minX: 0, maxX: 0 }, inertia: !reduce && !!window.InertiaPlugin, maxDuration: maxDur, dragClickables: true,
      snap: (x) => -(step > 0 ? Math.round(clamp(-x) / step) : 0) * step,
      onDrag() { u = clamp(-this.x); draw(); }, onThrowUpdate() { u = clamp(-this.x); draw(); },
    })[0];
    const ro = new ResizeObserver(measure); ro.observe(el); items.forEach((it) => ro.observe(it));
    measure();
    return () => { ro.disconnect(); drag.kill(); gsap.set([list, ...items], { clearProps: "transform" }); el.style.touchAction = ""; el.style.userSelect = ""; };
  });
})();
