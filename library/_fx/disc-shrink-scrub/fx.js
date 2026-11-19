(() => {
  kfFx.register("disc-shrink-scrub", (el, { options, reduce, scroller }) => {
    const discs = [...el.querySelectorAll('[data-fx-part="disc"]')];
    if (!discs.length || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const to = +(options.to ?? 0.4);
    if (reduce) { gsap.set(discs, { scale: to }); return () => gsap.set(discs, { clearProps: "transform" }); }
    const scrub = +(options.scrub ?? 1);
    const ease = kfFx.ease(options.ease || "power1.out", "power1.out");
    const tween = gsap.to(discs, {
      scale: to, ease,
      scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: options.start || "top top", end: options.end || "bottom bottom", scrub: scrub || true },
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); gsap.set(discs, { clearProps: "transform" }); };
  });
})();
