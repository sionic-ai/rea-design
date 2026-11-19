(() => {
  kfFx.register("window-burst-pin", (el, { options, reduce, scroller }) => {
    const frame = el.querySelector('[data-fx-part="frame"]');
    if (!frame) return;
    const sides = [el.querySelector('[data-fx-part="left"]'), el.querySelector('[data-fx-part="right"]')];
    const w = +(options.w ?? 240), h = +(options.h ?? 150), delay = +(options.delay ?? 0.5);
    const dur = +(options.dur ?? 2), back = +(options.back ?? 1.5), side = +(options.side ?? 1);
    const ease = kfFx.ease(options.ease || "power1.out", "power1.out");
    const clear = () => [frame, ...sides].filter(Boolean).forEach((x) => gsap.set(x, { clearProps: "width,height,transform,opacity" }));
    if (reduce) return clear;
    const mm = gsap.matchMedia();
    mm.add(`${options.min || "(min-width: 1025px)"} and (prefers-reduced-motion: no-preference)`, () => {
      gsap.set(frame, { width: w, height: h });
      const move = (x, o, d) => sides.forEach((s, i) => s && gsap.to(s, { xPercent: x * (i ? 1 : -1), opacity: o, delay, duration: d, ease: "power2.out", overwrite: true }));
      const grow = () => { gsap.to(frame, { width: "100vw", height: "100vh", delay, duration: dur, ease, overwrite: true }); move(100, 0, side); };
      const shrink = () => { gsap.to(frame, { width: w, height: h, duration: back, ease, overwrite: true }); move(0, 1, side); };
      ScrollTrigger.create({ trigger: el, scroller, start: "top top", end: "center center", onEnter: grow, onLeaveBack: shrink });
      return clear;
    });
    return () => mm.revert();
  });
})();
