(() => {
  kfFx.register("scale-swap-copy", (el, { options, reduce, scroller }) => {
    if (!window.ScrollTrigger) { gsap.set(el, { opacity: 1 }); return; }
    gsap.registerPlugin(ScrollTrigger);
    const trigger = (options.trigger && document.querySelector(options.trigger)) || el.parentElement;
    if (!trigger) return;
    const from = +(options.from ?? 0.7), out = +(options.out ?? 1.1), dur = reduce ? 0 : +(options.dur ?? 0.5);
    const pre = +(options.pre ?? 1);
    gsap.set(el, { opacity: 0, scale: pre });
    // The original cuts off anything in progress and starts fresh on enter and on return — going back and forth fast doesn’t stack sizes
    const go = (opacity, scale) => { gsap.killTweensOf(el); gsap.to(el, { opacity, scale, duration: dur }); };
    const st = ScrollTrigger.create({
      trigger, scroller, start: options.start || "top 33%", end: options.end || "bottom 66%",
      onEnter: () => go(1, 1), onEnterBack: () => go(1, 1),
      onLeave: () => go(0, out), onLeaveBack: () => go(0, from),
    });
    return () => { st.kill(); gsap.killTweensOf(el); gsap.set(el, { clearProps: "opacity,transform" }); };
  });
})();
