(() => {
  // Name wheel — the center sits off the left edge of the screen (radius R) and rows line up at equal angles. Wheel and drag move by the same amounts as the first-page wheel (.0011 · .0034 rows, .08 per frame), and it settles on the nearest row when idle
  const { reduce } = window.CO;
  const wheel = document.querySelector(".lb-wheel");
  const items = [...wheel.querySelectorAll(".lb-item")];
  const num = document.querySelector(".lb-preview__n");
  const N = items.length;
  let pos = 5, target = 5, idleAt = 0, drag = null, last = 0, on = -1;
  const geo = () => {
    const R = Math.max(900, innerHeight * 1.35), gap = Math.min(96, innerHeight * 0.1);
    return { R, step: gap / R, x0: Math.max(24, innerWidth * 0.03) };
  };
  const place = () => {
    const { R, step, x0 } = geo();
    items.forEach((it, i) => {
      const a = (i - pos) * step;
      const x = x0 - R + Math.cos(a) * R, y = Math.sin(a) * R;
      it.style.transform = `translate(${x}px, ${y}px) translateY(-50%) rotate(${(a * 180) / Math.PI}deg)`;
      it.style.opacity = String(Math.max(0, 1 - Math.abs(i - pos) / 7));
    });
    const k = Math.min(N - 1, Math.max(0, Math.round(pos)));
    if (k !== on) {
      on = k;
      items.forEach((it, i) => it.classList.toggle("is-on", i === k));
      if (num) num.textContent = String(k + 1).padStart(2, "0");
    }
  };
  const tick = (t) => {
    const dt = Math.min(4, Math.max(1, (t - (last || t)) / 16.667));
    last = t;
    if (!drag && t - idleAt > 160) target = Math.round(target);
    target = Math.min(N - 1, Math.max(0, target));
    pos += (target - pos) * (1 - Math.pow(1 - 0.08, dt));
    place();
    requestAnimationFrame(tick);
  };
  wheel.addEventListener("wheel", (e) => { e.preventDefault(); target += e.deltaY * 0.0011 * 4; idleAt = performance.now(); }, { passive: false });
  wheel.addEventListener("pointerdown", (e) => { drag = { y: e.clientY, t0: target }; wheel.setPointerCapture(e.pointerId); wheel.classList.add("is-grabbing"); });
  wheel.addEventListener("pointermove", (e) => { if (!drag) return; target = drag.t0 - (e.clientY - drag.y) * 0.0034 * 3; idleAt = performance.now(); });
  const up = () => { drag = null; wheel.classList.remove("is-grabbing"); idleAt = performance.now(); };
  wheel.addEventListener("pointerup", up);
  wheel.addEventListener("pointercancel", up);
  wheel.addEventListener("keydown", (e) => { if (e.key === "ArrowDown") target = Math.round(target) + 1; if (e.key === "ArrowUp") target = Math.round(target) - 1; idleAt = 0; });
  addEventListener("resize", place);
  if (reduce) {
    const snap = () => { target = Math.min(N - 1, Math.max(0, Math.round(target))); pos = target; place(); };
    ["wheel", "pointerup", "keydown"].forEach((ev) => wheel.addEventListener(ev, snap));
    snap();
    return;
  }
  requestAnimationFrame(tick);
})();
