// The arc at the section edge grows from 0 height, same as recruit-pnp commonAnimation.arc (.6s power2.out, top 80%, instant on the first screen)
(() => {
  kfFx.register("edge-arc-grow", (el, { options, reduce, scroller }) => {
    if (reduce || !window.gsap) return;
    const top = options.edge === "top";
    const dur = +(options.dur ?? 0.6), ease = options.ease || "power2.out";
    gsap.set(el, { scaleY: 0, transformOrigin: top ? "top center" : "bottom center" });
    const now = options.now === true || options.now === "true";
    const tw = now || !window.ScrollTrigger
      ? gsap.to(el, { scaleY: 1, duration: dur, ease })
      : gsap.to(el, { scaleY: 1, duration: dur, ease, scrollTrigger: { trigger: el, start: options.start || "top 80%", toggleActions: "play none none none", scroller } });
    return () => { tw.scrollTrigger?.kill(); tw.kill(); gsap.set(el, { clearProps: "transform" }); };
  });
})();
