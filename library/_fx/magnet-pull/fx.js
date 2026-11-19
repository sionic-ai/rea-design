// The button is pulled toward the cursor (distance from center × pull) and the inner label is pulled less (× label), creating layers.
// On release it springs back into place. Leaves the entry and exit spots as --fx-x·--fx-y (%) so the fill circle spreads from there
(() => {
  kfFx.register("magnet-pull", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const pull = +(options.pull ?? 0.32), lab = +(options.label ?? 0.18), dur = +(options.dur ?? 0.6), back = +(options.back ?? 0.9);
    // pull-y — when pulling differently vertically (Brand: horizontal 1/6 · vertical 1/3), spin — degrees rotated per px dragged horizontally
    const pullY = +(options["pull-y"] ?? pull), spin = +(options.spin ?? 0);
    // tilt — tilts by up to tilt according to the horizontal share (−1~1, relative to half the board width) away from the board center (Brand article card 1°)
    const tilt = +(options.tilt ?? 0);
    const ease = kfFx.ease(options.ease || "power3.out", "power3.out"), springy = options.spring || "elastic.out(1, 0.4)";
    const label = el.querySelector('[data-fx-part="label"]'), ring = el.querySelector('[data-fx-part="ring"]'), rng = +(options.ring ?? 0);
    const qx = gsap.quickTo(el, "x", { duration: dur, ease }), qy = gsap.quickTo(el, "y", { duration: dur, ease });
    const qr = spin || tilt ? gsap.quickTo(el, "rotation", { duration: dur, ease }) : null;
    // label-ease — when only the text is eased with a different curve (Brand: panel back.out(3) · text sine decel)
    const lease = options["label-ease"] ? kfFx.ease(options["label-ease"], ease) : ease;
    const lx = label && gsap.quickTo(label, "x", { duration: dur, ease: lease }), ly = label && gsap.quickTo(label, "y", { duration: dur, ease: lease });
    const rx = ring && gsap.quickTo(ring, "x", { duration: dur, ease }), ry = ring && gsap.quickTo(ring, "y", { duration: dur, ease });
    // mode: edge — drag is set not by distance ratio but by ‹position −1~1 from the panel edge› × rem (Brand: pill .5 · text .25 · dot .125rem)
    const edge = options.mode === "edge", rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const dots = [...el.querySelectorAll('[data-fx-part="dot"]')], dt = +(options.dot ?? 0);

    const origin = (e) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      el.style.setProperty("--fx-x", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--fx-y", `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    // The edge type is pushed with the CSS translate property instead of transform — once GSAP grabs transform it flattens that element’s CSS scale (hover pop) to none
    const pos = { x: 0, y: 0 };
    const paint = () => {
      const u = rem();
      el.style.translate = `${(pos.x * pull * u).toFixed(2)}px ${(pos.y * pullY * u).toFixed(2)}px`;
      if (label) label.style.translate = `${(pos.x * lab * u).toFixed(2)}px ${(pos.y * lab * u).toFixed(2)}px`;
      dots.forEach((d) => (d.style.translate = `${(pos.x * dt * u).toFixed(2)}px ${(pos.y * dt * u).toFixed(2)}px`));
    };
    const edgeTo = (x, y, v) => gsap.to(pos, { x, y, ...v, overwrite: true, onUpdate: paint });
    const enter = (e) => e.pointerType === "mouse" && origin(e);
    const move = (e) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      if (edge) {
        // Position from −1 to 1 relative to the panel edge. Measure from where the panel has already been pulled (included in getBoundingClientRect) so it doesn’t run away following the cursor.
        const c = gsap.utils.clamp(-1, 1);
        edgeTo(c((e.clientX - r.left) / (r.width / 2) - 1), c((e.clientY - r.top) / (r.height / 2) - 1), { duration: dur, ease });
        return;
      }
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      qx(dx * pull); qy(dy * pullY);
      qr?.(spin ? dx * pull * spin : Math.max(-1, Math.min(1, dx / (r.width / 2 || 1))) * tilt);
      if (label) { lx(dx * lab); ly(dy * lab); }
      if (ring) { rx(dx * rng); ry(dy * rng); }
    };
    const leave = (e) => {
      if (e.pointerType !== "mouse") return;
      origin(e);
      if (edge) { edgeTo(0, 0, springy === "none" ? { duration: dur, ease } : { duration: back, ease: springy }); return; }
      // spring: none — the original also passes 0 with the same quickTo on release, so it returns along the same curve as when dragged
      if (springy === "none") { qx(0); qy(0); qr?.(0); if (label) { lx(0); ly(0); } if (ring) { rx(0); ry(0); } return; }
      gsap.to([el, label, ring].filter(Boolean), { x: 0, y: 0, ...(spin || tilt ? { rotation: 0 } : {}), duration: back, ease: springy, overwrite: true });
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      gsap.killTweensOf(pos);
      [el, label, ...dots].filter(Boolean).forEach((n) => (n.style.translate = ""));
      const all = [el, label, ring, ...dots].filter(Boolean);
      gsap.killTweensOf(all);
      gsap.set(all, { clearProps: "transform" });
    };
  });
})();
