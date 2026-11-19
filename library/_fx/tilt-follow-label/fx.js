(() => {
  // Original Brand enter door — the ‹Click to enter› text trails the cursor at a .12 ratio, tilting on the Y · X axes with perspective(800px) by the remaining distance (.15° per 1px)
  kfFx.register("tilt-follow-label", (el, { options, reduce, hover }) => {
    const label = el.querySelector('[data-fx-part="label"]');
    if (!label || !hover) return;
    const lerp = +options.lerp || 0.12, tilt = +(options.tilt ?? 0.15), persp = +options.perspective || 800;
    let x = 0, y = 0, tx = 0, ty = 0, inside = false, first = true;
    const move = (e) => { const r = el.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; if (first) { x = tx; y = ty; first = false; } };
    const enter = () => { inside = true; gsap.to(label, { autoAlpha: 1, duration: 0.3, overwrite: true }); };
    const leave = () => { inside = false; gsap.to(label, { autoAlpha: 0, duration: 0.3, overwrite: true }); };
    const tick = () => {
      if (!inside && first) return;
      const dx = tx - x, dy = ty - y;
      x += dx * (reduce ? 1 : lerp); y += dy * (reduce ? 1 : lerp);
      label.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) perspective(${persp}px) rotateY(${reduce ? 0 : (dx * tilt).toFixed(2)}deg) rotateX(${reduce ? 0 : (-dy * tilt).toFixed(2)}deg)`;
    };
    el.addEventListener("pointermove", move); el.addEventListener("pointerenter", enter); el.addEventListener("pointerleave", leave);
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); el.removeEventListener("pointermove", move); el.removeEventListener("pointerenter", enter); el.removeEventListener("pointerleave", leave); gsap.set(label, { clearProps: "all" }); };
  });
})();
