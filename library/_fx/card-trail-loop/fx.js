// Positions are ratios of the area’s width and height — being function values, they are re-measured from the next loop after the window size changes
(() => {
  kfFx.register("card-trail-loop", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      if (reduce) return;
      gsap.registerPlugin(ScrollTrigger);
      const W = () => el.offsetWidth, H = () => el.offsetHeight;
      const tl = gsap.timeline({ repeat: -1, scrollTrigger: { scroller, trigger: el, start: "top bottom", end: "bottom top", toggleActions: "restart pause restart pause" } });
      el.querySelectorAll("[data-fx-part=card]").forEach((c, i) => {
        tl.set(c, { x: () => -W() * 0.1, y: () => H() * 0.8, rotate: -14, scale: 0.6, autoAlpha: 0 }, i === 0 ? 0.4 : ">+3")
          .to(c, { x: () => W() * (0.32 + i * 0.12), y: () => H() * (0.36 - i * 0.06), rotate: 8, scale: 1, autoAlpha: 1, duration: 1, ease: "linear" })
          .to(c, { x: () => W() * 1.05, y: () => -H() * 0.2, rotate: 18, scale: 0.7, autoAlpha: 0, duration: 1, ease: "linear" }, ">+1.2");
      });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
