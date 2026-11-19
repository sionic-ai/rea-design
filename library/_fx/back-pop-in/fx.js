(() => {
  kfFx.register("back-pop-in", (el, { options, reduce, scroller }) => {
    if (reduce || !window.ScrollTrigger) { gsap.set(el, { autoAlpha: 1 }); return; }
    gsap.registerPlugin(ScrollTrigger);
    const scale = +(options.scale ?? 0.85), y = +(options.y ?? 10), dur = +(options.dur ?? 1.3);
    const ease = kfFx.ease(options.ease || "back.inOut(4)", "back.inOut(4)");
    gsap.set(el, { autoAlpha: 0, ...(options.origin && { transformOrigin: options.origin }) });
    // Once when the top edge touches the bottom of the screen — bounces back small, from slightly below, and settles in place
    const st = ScrollTrigger.create({
      trigger: el, scroller, start: options.start || "0% 100%", once: true,
      onEnter: () => gsap.fromTo(el, { scale, y }, { scale: 1, y: 0, autoAlpha: 1, duration: dur, ease }),
    });
    return () => { st.kill(); gsap.killTweensOf(el); gsap.set(el, { clearProps: "transform,opacity,visibility,transformOrigin" }); };
  });
})();
