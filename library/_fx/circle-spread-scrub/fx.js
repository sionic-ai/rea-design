// A small circle (100px) at the top center of the section spreads to 300% wide and 150% tall while the section passes through the screen, becoming the section background (Brand site information__bg)
(() => {
  kfFx.register("circle-spread-scrub", (el, { options, reduce, scroller }) => {
    const circle = el.querySelector('[data-fx-part="circle"]');
    if (!circle) return;
    gsap.registerPlugin(ScrollTrigger);
    const narrow = +(options.narrow ?? 768);
    const w = () => (innerWidth <= narrow ? options["w-narrow"] || "700%" : options.w || "300%");
    const h = options.h || "150%";
    const mm = gsap.matchMedia();
    if (reduce) gsap.set(circle, { width: w(), height: h });
    else
      mm.add("all", () => {
        // No curve given, so the GSAP default (power1.out) applies to the scroll progress — same as the original
        gsap.timeline({ scrollTrigger: { trigger: el, scroller, start: options.start || "top bottom", end: options.end || "bottom top", scrub: +(options.scrub ?? 1), invalidateOnRefresh: true } })
          .to(circle, { width: w, height: h, duration: 1.5 }, 0);
      });
    return () => {
      mm.revert();
      gsap.set(circle, { clearProps: "width,height" });
    };
  });
})();
