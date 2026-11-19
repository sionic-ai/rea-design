// Children pop out in turn (.1s) from .8x and transparent, each with an added random 0~1s delay so they burst off-beat (original seesaw word collection · term bubbles)
(() => {
  kfFx.register("random-pop-stagger", (el, { options, reduce, scroller }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    if (reduce) { gsap.set(items, { opacity: 1, scale: 1 }); return () => gsap.set(items, { clearProps: "opacity,scale,transform" }); }
    gsap.set(items, { opacity: 0, scale: +(options.from ?? 0.8) });
    const spread = +(options.random ?? 1);
    const tw = gsap.to(items, {
      opacity: 1,
      scale: 1,
      delay: () => Math.random() * spread,
      duration: +(options.dur ?? 0.8),
      ease: options.ease || "back.out(3)",
      stagger: +(options.stagger ?? 0.1),
      scrollTrigger: { trigger: el, scroller: scroller || undefined, start: options.start || "top 80%", once: true },
    });
    return () => { tw.scrollTrigger?.kill(); tw.kill(); gsap.set(items, { clearProps: "opacity,scale,transform" }); };
  });
})();
