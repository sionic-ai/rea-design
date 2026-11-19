(() => {
  kfFx.register("drop-squash", (el, { options, reduce }) => {
    // Fall height (px, negative upward), initial tilt, delay. Fall time is height/speed seconds, minimum min
    const drop = +(options.drop ?? -420), rot = +(options.rot ?? -22), delay = +(options.delay ?? 0);
    const speed = +options.speed || 720, min = +(options.min ?? 1.2);
    const sx = +(options.squash ?? 1.08), ease = kfFx.ease(options.ease || "power2.in", "power2.in");
    let tl, io;
    gsap.set(el, { transformOrigin: "50% 100%" });
    if (reduce) return () => gsap.set(el, { clearProps: "transform,opacity,visibility" });
    gsap.set(el, { autoAlpha: 0 });
    const play = () => {
      tl = gsap.timeline({ delay })
        .set(el, { autoAlpha: 1 })
        .fromTo(el, { y: drop, rotation: rot, scaleX: 1, scaleY: 1 }, { y: 0, rotation: 0, duration: Math.max(min, Math.abs(drop) / speed), ease })
        .to(el, { scaleX: sx, scaleY: 2 - sx, duration: 0.08, ease: "power1.out" })
        .to(el, { scaleX: 1, scaleY: 1, duration: 0.18, ease: "back.out(2)" });
    };
    io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); play(); } }, { threshold: +(options.threshold ?? 0.05) });
    io.observe(options.area ? el.closest(options.area) || el : el);
    return () => { io.disconnect(); tl?.kill(); gsap.set(el, { clearProps: "transform,opacity,visibility" }); };
  });
})();
