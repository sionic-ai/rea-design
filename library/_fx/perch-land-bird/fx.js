(() => {
  const spring = (p) => 1 - Math.cos(p * 4.5 * Math.PI) * Math.exp(-p * 6);
  kfFx.register("perch-land-bird", (el, { options, reduce }) => {
    const bird = el.querySelector('[data-fx-part="bird"]');
    if (!bird) return;
    const tail = el.querySelector('[data-fx-part="tail"]'), branch = el.querySelector('[data-fx-part="branch"]'), note = el.querySelector('[data-fx-part="note"]');
    const shown = [bird, note].filter(Boolean);
    if (reduce) { gsap.set(shown, { opacity: 1 }); return () => gsap.set(shown, { clearProps: "opacity" }); }
    const fx = +(options.x ?? 200), fy = +(options.y ?? 120), delay = +(options.delay ?? 0.25), fly = +(options.fly ?? 0.35);
    const tilt = +(options.tilt ?? -8), settle = +(options.settle ?? 1), every = +(options.every || 5);
    const inCubic = kfFx.ease("0.55,0.055,0.675,0.19", "power2.in"), outQuad = kfFx.ease("0.25,0.46,0.45,0.94", "power2.out"), outCubic = kfFx.ease("0.215,0.61,0.355,1", "power2.out");
    let loop = 0;
    // Shake the body twice at -2° (two 60ms round trips), then after 1 second wag the tail four times at 1.05 scale·-3°·2px up (four 140ms round trips)
    const wiggle = () => {
      gsap.fromTo(bird, { rotation: 0 }, { rotation: -2, duration: 0.06, ease: outQuad, repeat: 3, yoyo: true, overwrite: "auto" });
      if (tail) gsap.fromTo(tail, { scale: 1, rotation: 0, y: 0 }, { scale: 1.05, rotation: -3, y: -2, duration: 0.14, delay: 1, ease: outCubic, repeat: 7, yoyo: true, overwrite: "auto" });
    };
    // It flies in from the bottom right and lands, the body and branch tilt with a thump then spring upright, and the note turns on
    const tl = gsap.timeline()
      .fromTo(bird, { x: fx, y: fy, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: fly, delay, ease: inCubic })
      .addLabel("land")
      .to(bird, { rotation: tilt, duration: 0.08, ease: "none" }, "land")
      .to(bird, { rotation: 0, duration: settle, ease: spring }, "land+=0.08");
    if (note) tl.to(note, { opacity: 1, duration: 0.02, ease: "none" }, "land");
    if (branch) tl.to(branch, { rotation: tilt, duration: 0.08, ease: "none" }, "land").to(branch, { rotation: 0, duration: settle, ease: spring }, "land+=0.08");
    tl.call(() => { wiggle(); loop = setInterval(wiggle, every * 1000); }, null, `land+=${0.08 + settle}`);
    return () => {
      tl.kill();
      clearInterval(loop);
      gsap.killTweensOf([bird, tail, branch, note].filter(Boolean));
      gsap.set([bird, tail, branch, note].filter(Boolean), { clearProps: "transform,opacity" });
    };
  });
})();
