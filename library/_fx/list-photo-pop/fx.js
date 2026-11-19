// Only the lit list row is sharp, and the photos at both ends pop out per the angle table — auto-advance and hover pause keep the original delayedCall(4) as is
(() => {
  const ANGLES = [-11, 15, -15, 11, -14, 15, -11, 12, -8, 12, -11, 15];
  kfFx.register("list-photo-pop", (el, { options, reduce }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const every = +(options.every ?? 4);
    const angles = options.angles ? String(options.angles).split(",").map(Number) : ANGLES;
    if (options.dim != null) el.style.setProperty("--fx-dim", +options.dim);
    items.forEach((it, i) => it.querySelectorAll('[data-fx-part="photo"]').forEach((p, k) => p.style.setProperty("--fx-angle", `${angles[(2 * i + k) % angles.length] || 0}deg`)));
    let on = 0, timer = null;
    const paint = () => items.forEach((it, i) => it.toggleAttribute("data-on", i === on));
    const later = () => { timer?.kill(); timer = !reduce && every > 0 && items.length > 1 ? gsap.delayedCall(every, next) : null; };
    const next = () => { on = (on + 1) % items.length; paint(); later(); };
    const offs = items.map((it, i) => {
      const label = it.querySelector('[data-fx-part="label"]') || it;
      const enter = () => { on = i; paint(); timer?.kill(); };
      const leave = () => later();
      label.addEventListener("mouseenter", enter);
      label.addEventListener("mouseleave", leave);
      return () => { label.removeEventListener("mouseenter", enter); label.removeEventListener("mouseleave", leave); };
    });
    paint();
    later();
    return () => {
      timer?.kill();
      offs.forEach((f) => f());
      items.forEach((it) => { it.removeAttribute("data-on"); it.querySelectorAll('[data-fx-part="photo"]').forEach((p) => p.style.removeProperty("--fx-angle")); });
      el.style.removeProperty("--fx-dim");
    };
  });
})();
