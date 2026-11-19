(() => {
  // Compass: on entering view the plate spins back from -500° and stands in 1.2s, and the needle appears in .2s. The needle is tied to scroll (scrub .8) and turns 0 → 380° while passing the section.
  kfFx.register("compass-scrub", (el, { options, reduce, hover, scroller }) => {
    const needle = el.querySelector('[data-fx-part="needle"]');
    if (!needle) return;
    const turn = +(options.turn ?? 380);
    const spin = +(options.spin ?? -500);
    const dur = +(options.dur ?? 1.2);
    const ease = kfFx.ease(options.ease || "0.25,0.46,0.45,0.94", "power1.out");
    if (reduce) { gsap.set(el, { rotation: 0 }); gsap.set(needle, { opacity: 1, rotation: 0 }); return () => gsap.set([el, needle], { clearProps: "transform,opacity" }); }
    gsap.set(el, { rotation: spin });
    gsap.set(needle, { opacity: 0 });
    const trigger = options.trigger ? el.closest(options.trigger) || el : el;
    const enter = ScrollTrigger.create({
      trigger: el, scroller, start: "top 90%", once: true,
      onEnter: () => {
        gsap.to(el, { rotation: 0, duration: dur, ease });
        gsap.to(needle, { opacity: 1, duration: 0.2 });
      }
    });
    const scrub = gsap.to(needle, { rotation: turn, ease: "none", scrollTrigger: { trigger, scroller, start: "top bottom", end: "bottom top", scrub: +(options.scrub ?? 0.8) } });
    return () => { enter.kill(); scrub.scrollTrigger && scrub.scrollTrigger.kill(); scrub.kill(); gsap.set([el, needle], { clearProps: "transform,opacity" }); };
  });
})();
