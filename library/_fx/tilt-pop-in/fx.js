// The original hangs a separate ScrollTrigger.batch per element, so each starts after entering plus the batch interval (.1s) — that delay is carried over too (wait)
(() => {
  kfFx.register("tilt-pop-in", (el, { options, reduce, scroller }) => {
    if (reduce || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const y = +(options.y ?? 50), tilt = +(options.tilt ?? -15), dur = +(options.dur ?? 0.5), wait = +(options.wait ?? 0.1);
    const ease = kfFx.ease(options.ease || "power1.out", "power1.out");
    const clear = () => gsap.set(el, { clearProps: "opacity,visibility,transform" });
    gsap.set(el, { autoAlpha: 0, y, rotate: tilt });
    let call;
    const st = ScrollTrigger.create({
      trigger: el, ...(scroller && { scroller }), start: options.start || "top bottom", once: true,
      onEnter: () => { call = gsap.to(el, { autoAlpha: 1, y: 0, rotate: 0, duration: dur, delay: wait, ease, onComplete: clear }); },
    });
    return () => { st.kill(); call?.kill(); clear(); };
  });
})();
