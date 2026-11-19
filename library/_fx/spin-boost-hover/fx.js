// Text rings and badges spin at a constant speed, speed up on hover and return on release — the speed follows 1 − e^(−ease·dt), so it never changes abruptly
(() => {
  kfFx.register("spin-boost-hover", (el, { options, reduce }) => {
    if (reduce) return;
    const ring = el.querySelector('[data-fx-part="ring"]') || el;
    const base = +(options.speed ?? 20), boost = +(options.hover ?? 60), rate = +(options.ease ?? 3.5);
    let speed = base, angle = 0, hot = false, last = 0, id = 0;
    const on = () => { hot = true; };
    const off = () => { hot = false; };
    el.addEventListener("pointerenter", on);
    el.addEventListener("pointerleave", off);
    el.addEventListener("focusin", on);
    el.addEventListener("focusout", off);
    const tick = (now) => {
      const dt = last ? Math.min(Math.max(1, now - last), 100) / 1000 : 0;
      last = now;
      speed += ((hot ? boost : base) - speed) * (1 - Math.exp(-rate * dt));
      angle = (angle + speed * dt) % 360;
      ring.style.transform = `rotate(${angle}deg)`;
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(id);
      el.removeEventListener("pointerenter", on);
      el.removeEventListener("pointerleave", off);
      el.removeEventListener("focusin", on);
      el.removeEventListener("focusout", off);
      ring.style.transform = "";
    };
  });
})();
