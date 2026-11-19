// Hover one stacked menu row and it snaps straight into place, rows above move up and rows below move down by (45 + 5 × rows away)px, each tilting ±5°.
(() => {
  kfFx.register("menu-spread-hover", (el, { options, reduce, hover }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length || reduce || !hover) return;
    const base = +(options.base ?? 45), step = +(options.step ?? 5), spin = +(options.spin ?? 5), dur = +(options.dur ?? 1);
    const ease = kfFx.ease(options.ease || "circ.out", "circ.out");
    const keepTilt = options.reset !== "all";
    const rand = (a, b) => Math.floor(Math.random() * (b - a + 1) + a);
    const enter = (i) => () => {
      gsap.to(items[i], { y: 0, rotate: 0, duration: dur, ease, overwrite: "auto" });
      items.forEach((o, j) => {
        if (j === i) return;
        const d = base + step * Math.abs(i - j);
        gsap.to(o, { y: j < i ? -d : d, rotate: rand(-spin, spin), duration: dur, ease, overwrite: "auto" });
      });
    };
    const handlers = items.map((it, i) => { const h = enter(i); it.addEventListener("pointerenter", h); return h; });
    // The original only resets height on leave and keeps the swayed angle (with reset: all the angle resets too)
    const leave = () => gsap.to(items, { y: 0, ...(keepTilt ? {} : { rotate: 0 }), duration: dur, ease, overwrite: "auto" });
    el.addEventListener("pointerleave", leave);
    return () => {
      items.forEach((it, i) => it.removeEventListener("pointerenter", handlers[i]));
      el.removeEventListener("pointerleave", leave);
      gsap.killTweensOf(items);
      gsap.set(items, { clearProps: "transform" });
    };
  });
})();
