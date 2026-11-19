// A line on the section’s left edge is tied to scroll and grows from a short stub to the section’s full height — the original is a Webflow IX3 scroll timeline (scrub 1)
(() => {
  kfFx.register("rail-grow-scrub", (el, { options, reduce, scroller }) => {
    const rail = el.querySelector('[data-fx-part="rail"]');
    if (!rail || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const full = options.to || "100%";
    if (reduce) {
      gsap.set(rail, { height: full });
      return () => gsap.set(rail, { clearProps: "height" });
    }
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(rail, { height: options.from || "15rem" }, {
        height: full,
        duration: 1,
        ease: kfFx.ease(options.ease || "power2.inOut", "power2.inOut"),
        scrollTrigger: {
          trigger: el,
          ...(scroller && { scroller }),
          start: options.start || "15% bottom",
          end: options.end || "70% top",
          scrub: +(options.scrub ?? 1),
          invalidateOnRefresh: true,
        },
      });
    });
    return () => { mm.revert(); gsap.set(rail, { clearProps: "height" }); };
  });
})();
