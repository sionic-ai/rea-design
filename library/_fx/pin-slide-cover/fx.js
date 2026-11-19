(() => {
  // Pin the panel to the screen, and among the stacked sections from the second on, each rises one at a time from 100% below and covers the previous one.
  // Per px scroll on one section (original 1000), scrub 2 to follow with a lag, power1.inOut per section.
  kfFx.register("pin-slide-cover", (el, { options, reduce, scroller }) => {
    const slides = [...el.querySelectorAll("[data-fx-part=slide]")];
    if (slides.length < 2 || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const per = +(options.per ?? 1000) || 1000, scrub = +(options.scrub ?? 2);
    const target = el.querySelector("[data-fx-part=pin]") || el;
    // Given min, pins only at that width or wider (the original has a separate one-photo plate at 768px and below)
    const min = +(options.min ?? 0);
    const mm = gsap.matchMedia();
    mm.add(`${min ? `(min-width: ${min}px) and ` : ""}(prefers-reduced-motion: no-preference)`, () => {
      gsap.set(slides[0], { yPercent: 0 });
      gsap.timeline({
        scrollTrigger: { trigger: target, scroller, pin: true, scrub, start: "top top", end: () => `+=${(slides.length - 1) * per}`, invalidateOnRefresh: true },
      }).fromTo(slides.slice(1), { yPercent: 100 }, { yPercent: 0, stagger: 1, ease: kfFx.ease(options.ease || "power1.inOut", "power1.inOut") });
    });
    return () => mm.revert();
  });
})();
