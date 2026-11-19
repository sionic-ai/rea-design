// When the photo or video cell reaches the center of the screen, a flat panel stuck to the top edge comes down and opens (polygon clip), and the inner image settles from 1.3x to its size.
(() => {
  kfFx.register("clip-drop-zoom", (el, { options, reduce, scroller }) => {
    const media = el.querySelector('[data-fx-part="media"]') || el.firstElementChild;
    if (reduce) { gsap.set(el, { clipPath: "none" }); return; }
    const dur = +(options.dur ?? 1.6);
    const ease = kfFx.ease(options.ease || "expo.inOut", "expo.inOut");
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease, delay: +(options.delay ?? 0.1) }, scrollTrigger: { scroller, trigger: el, start: options.start || "top 50%", once: true } });
      tl.fromTo(el, { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" }, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: dur });
      if (media) tl.fromTo(media, { scale: +(options.from ?? 1.3), transformOrigin: "50% 50%" }, { scale: 1, duration: dur, delay: 0 }, "<");
    }, el);
    return () => ctx.revert();
  });
})();
