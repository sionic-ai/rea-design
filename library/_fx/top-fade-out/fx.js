// For each paragraph, when its top edge touches the line 100px from the top of the screen it rises 1px with 1s expo.out while fading, and sharpens again when scrolled back (Brand mobile statement paragraph).
(() => {
  kfFx.register("top-fade-out", (el, { options, reduce, scroller }) => {
    if (reduce || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const items = el.querySelectorAll('[data-fx-part="item"]');
    const targets = items.length ? [...items] : [el];
    const tweens = targets.map((t) => gsap.to(t, {
      y: +(options.y ?? -1), opacity: +(options.to ?? 0), duration: +(options.dur ?? 1), ease: kfFx.ease(options.ease || "expo.out", "expo.out"),
      scrollTrigger: { trigger: t, scroller: scroller || undefined, start: options.start || "top top+=100", toggleActions: "play none none reverse" },
    }));
    return () => { tweens.forEach((tw) => { tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); }); gsap.set(targets, { clearProps: "transform,opacity" }); };
  });
})();
