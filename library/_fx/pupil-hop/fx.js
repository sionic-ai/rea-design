(() => {
  // Eye roll — every step seconds the pupil (data-fx-part="pupil") jumps between left, right, top left, bottom right and center (position just switches, no in-between motion)
  kfFx.register("pupil-hop", (el, { options, reduce }) => {
    const pupils = el.querySelectorAll('[data-fx-part="pupil"]');
    if (!pupils.length || reduce) return;
    const step = +options.step || 1, reach = +(options.reach ?? 40);
    const tl = gsap.timeline({ repeat: -1 })
      .set(pupils, { xPercent: -reach, yPercent: 0 }, `<${step}`)
      .set(pupils, { xPercent: reach, yPercent: 0 }, `<${step}`)
      .set(pupils, { xPercent: -reach, yPercent: -reach }, `<${step}`)
      .set(pupils, { xPercent: reach, yPercent: reach }, `<${step}`)
      .set(pupils, { xPercent: 0, yPercent: 0 }, `<${step}`);
    return () => { tl.kill(); gsap.set(pupils, { clearProps: "transform" }); };
  });
})();
