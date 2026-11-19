// Floating decorations drift with parallax by their speed multiplier e — while passing from the bottom to the top of the screen, yPercent +50e → −50e (% of own height), scrub 1 (follows 1 second late).
// The bigger the multiplier, the faster and farther it passes, so it looks closer to the front. Start and end are pulled by −50e% so decorations pass in place within the screen
(() => {
  kfFx.register("speed-parallax", (el, { options, reduce, scroller }) => {
    const e = +(options.speed ?? 1);
    if (reduce || !e) return;
    gsap.registerPlugin(ScrollTrigger);
    const scrub = options.scrub === "true" ? true : +(options.scrub ?? 1);
    const tw = gsap.fromTo(el, { yPercent: 50 * e }, { yPercent: -50 * e, ease: "none", scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: `${-50 * e}% bottom`, end: `${100 - 50 * e}% top`, scrub, invalidateOnRefresh: true } });
    return () => { tw.scrollTrigger?.kill(); tw.kill(); gsap.set(el, { clearProps: "transform" }); };
  });
})();
