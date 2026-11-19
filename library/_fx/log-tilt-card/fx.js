// Hovering a card tilts it in 3D by how far the mouse is from the card center — axis is (dy/200, −dx/200), angle is ln(distance)×.4°, and it lifts to 1.04x
// A white-light pool follows the mouse position (on hover, center .3 · 40% circle, on move .4 · 80% circle). The tilt is bridged by a css transition (.5s ease-out).
(() => {
  kfFx.register("log-tilt-card", (el, { options, reduce, hover }) => {
    const inner = el.querySelector('[data-fx-part="inner"]');
    if (!inner || reduce || !hover) return;
    const glow = el.querySelector('[data-fx-part="glow"]');
    const lift = +(options.lift ?? 1.04), k = +(options.k ?? 0.4), axis = +(options.axis ?? 200);
    let r = null;
    const move = (e) => {
      if (!r) return;
      const dx = e.clientX - r.x - r.width / 2, dy = e.clientY - r.y - r.height / 2;
      const d = Math.max(1, Math.hypot(dx, dy));
      inner.style.transform = `scale3d(${lift}, ${lift}, ${lift}) rotate3d(${dy / axis}, ${-dx / axis}, 0, ${Math.log(d) * k}deg)`;
      if (glow) glow.style.background = `radial-gradient(circle at ${dx + r.width / 2}px ${dy + r.height / 2}px, color-mix(in srgb, var(--kf-surface) 40%, transparent), transparent 80%)`;
    };
    const enter = () => {
      r = el.getBoundingClientRect();
      document.addEventListener("mousemove", move);
      if (glow) glow.style.background = "radial-gradient(circle at center, color-mix(in srgb, var(--kf-surface) 30%, transparent), transparent 40%)";
    };
    const leave = () => { document.removeEventListener("mousemove", move); inner.style.transform = ""; r = null; };
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    return () => { leave(); el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave); if (glow) glow.style.background = ""; };
  });
})();
