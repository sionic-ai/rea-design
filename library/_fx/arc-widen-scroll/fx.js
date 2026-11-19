(() => {
  // The big circle forming the section boundary (width from vw · radius half) is tied to scroll and grows into a to vw circle — to keep the center it shifts left by −(width−100)/2 vw, so
  // The arc edge hanging on the screen gradually flattens out. The original is a to tween with scrub 1 that leaves GSAP’s default curve (power1.out) as is
  kfFx.register("arc-widen-scroll", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const up = Math.max(1, Math.round(+(options.up ?? 1)));
    let host = el;
    for (let i = 0; i < up && host.parentElement; i++) host = host.parentElement;
    const to = +(options.to ?? 400);
    const min = +(options.min ?? 992);
    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${min}px) and (prefers-reduced-motion: no-preference)`, () => {
      gsap.to(el, {
        width: `${to}vw`,
        height: `${to}vw`,
        borderRadius: `${to / 2}vw`,
        left: `${-(to - 100) / 2}vw`,
        ease: options.ease ? kfFx.ease(options.ease, "power1.out") : "power1.out",
        scrollTrigger: {
          trigger: host,
          ...(scroller && { scroller }),
          start: options.start || "top top",
          end: options.end || "bottom top",
          scrub: +(options.scrub ?? 1),
        },
      });
    });
    return () => mm.revert();
  });
})();
