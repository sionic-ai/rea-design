// Original does, on every scroll, ”element top edge < If screen height × 5/6 then add a class and run the CSS keyframes once — moves with the same line (top 83.33%) and the same curve
(() => {
  kfFx.register("corner-tilt-in", (el, { options, reduce, scroller }) => {
    if (reduce || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const tilt = +(options.tilt ?? 8), dur = +(options.dur ?? 1), delay = +(options.delay ?? 0);
    const ease = kfFx.ease(options.ease || "0.26,0.04,0.18,0.98", "power3.out");
    const clear = () => gsap.set(el, { clearProps: "opacity,visibility,transform" });
    gsap.set(el, { autoAlpha: 0, rotate: tilt });
    let call;
    const st = ScrollTrigger.create({
      trigger: el, ...(scroller && { scroller }), start: options.start || "top 83.333%", once: true,
      onEnter: () => { call = gsap.to(el, { autoAlpha: 1, rotate: 0, duration: dur, delay, ease, onComplete: clear }); },
    });
    return () => { st.kill(); call?.kill(); clear(); };
  });
})();
