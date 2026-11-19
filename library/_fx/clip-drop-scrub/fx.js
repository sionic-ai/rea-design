(() => {
  kfFx.register("clip-drop-scrub", (el, { options, reduce, scroller }) => {
    const photo = el.querySelector(':scope > [data-fx-part="photo"]') || el.firstElementChild;
    if (reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const ease = kfFx.ease(options.ease || "sine.inOut", "sine.inOut");
    const fx = gsap.context(() => {
      // lag — follows the scroll this many seconds late (scrub number, Brand gold string 2). 0 means immediately
      const lag = +(options.lag ?? 0);
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, scroller, start: options.start || "top bottom", end: options.end || "center center", scrub: lag > 0 ? lag : true } });
      tl.fromTo(el, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease }, 0);
      if (photo) tl.fromTo(photo, { yPercent: +(options.drop ?? -30) }, { yPercent: 0, ease }, 0);
    });
    return () => fx.revert();
  });
})();
