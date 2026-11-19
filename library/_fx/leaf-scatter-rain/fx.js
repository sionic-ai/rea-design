// One leaf image ([data-fx-part=Multiplies leaf]) into count pieces scattered across the section, each leaf falls straight down at a different length, with side sway and rotation on a 1.5s tempo.
// Each leaf’s start position, length and sway width are set once when attached, and after all have fallen it rests .5~1.5s and falls again from the same spot
(() => {
  kfFx.register("leaf-scatter-rain", (el, { options, reduce }) => {
    const leaf = el.querySelector('[data-fx-part="leaf"]');
    if (!leaf) return;
    const count = Math.max(1, +options.count || 14), fall = +(options.fall ?? 20), spread = +(options.spread ?? 10);
    const xMin = +(options["x-min"] ?? -800), xMax = +(options["x-max"] ?? 500), drop = +(options.drop ?? 2);
    const sway = +(options.sway ?? 120), spin = +(options.spin ?? 180), beat = +options.beat || 1.5;
    const R = gsap.utils.random;
    const H = innerHeight * drop;
    const made = Array.from({ length: count }, () => {
      const c = leaf.cloneNode(true);
      c.removeAttribute("data-fx-part");
      c.classList.add("fx-leaf-scatter");
      el.append(c);
      gsap.set(c, { x: R(xMin, xMax), y: R(-H, 0), rotation: R(0, 360) });
      if (reduce) return { c, tl: null };
      const reps = Math.ceil(fall / beat);
      const tl = gsap.timeline({ repeat: -1, repeatDelay: R(0.5, 1.5) })
        .to(c, { duration: Math.max(0.1, fall + R(-spread, spread)), y: `+=${H * 1.3}`, ease: "none" }, 0)
        .to(c, { x: `+=${R(-sway, sway)}`, ease: "sine.inOut", yoyo: true, repeat: reps, duration: beat }, 0)
        .to(c, { rotation: `+=${R(-spin, spin)}`, ease: "sine.inOut", yoyo: true, repeat: reps, duration: beat }, 0);
      return { c, tl };
    });
    return () => made.forEach(({ c, tl }) => { tl?.kill(); c.remove(); });
  });
})();
