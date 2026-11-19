(() => {
  kfFx.register("squish-pop-hover", (el, { options, reduce, hover }) => {
    if (reduce) return;
    const targets = options.target ? [...el.querySelectorAll(`[data-fx-part="${options.target}"]`)] : [el];
    if (!targets.length) return;
    const sx = +(options.sx ?? 1), sy = +(options.sy ?? 0.8), rot = +(options.rotate ?? 0);
    const to = +(options.to ?? 1), dur = +(options.dur ?? 0.2), hit = +(options.hit ?? 0.01);
    const outDur = +(options.out ?? 0.2);
    const back = kfFx.ease("0.175,0.885,0.32,1.275", "back.out(1.7)");
    const expo = kfFx.ease("0.19,1,0.22,1", "expo.out");
    // The original shrinks over 10ms on entry (sx·sy·rotate) then pops up to the to scale with back.out — the rotated angle stays during the pop
    const enter = () => targets.forEach((t, i) => {
      gsap.killTweensOf(t);
      const r = options.alt && i % 2 ? -rot : rot;
      gsap.timeline()
        .to(t, { scaleX: sx, scaleY: sy, rotation: r, duration: hit, ease: expo })
        .to(t, { scaleX: to, scaleY: to, duration: dur, ease: back });
    });
    const leave = () => targets.forEach((t) => {
      gsap.killTweensOf(t);
      gsap.to(t, { scaleX: 1, scaleY: 1, rotation: 0, duration: outDur, ease: expo });
    });
    const area = (options.area && el.querySelector(`[data-fx-part="${options.area}"]`)) || el;
    if (hover) { area.addEventListener("pointerenter", enter); area.addEventListener("pointerleave", leave); }
    el.addEventListener("focusin", enter);
    el.addEventListener("focusout", leave);
    return () => {
      area.removeEventListener("pointerenter", enter);
      area.removeEventListener("pointerleave", leave);
      el.removeEventListener("focusin", enter);
      el.removeEventListener("focusout", leave);
      targets.forEach((t) => { gsap.killTweensOf(t); gsap.set(t, { clearProps: "transform" }); });
    };
  });
})();
