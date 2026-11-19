// When screen-height sections stack in a row, the previous section, after its bottom touches the screen bottom, follows downward at half its own height while being covered by the next one,
// The center photo tilts -5° and rises in reverse, the text rises faster, and the back half is covered by a same-color veil that blurs it (original c-stacking-sections values)
(() => {
  kfFx.register("sink-stack-sections", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    const sections = [...el.querySelectorAll('[data-fx-part="section"]')];
    if (!sections.length) return;
    const push = +(options.push ?? 50), tilt = +(options.tilt ?? -5), lift = +(options.lift ?? -50), copyLift = +(options.copy ?? -100);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      sections.forEach((s) => {
        const media = s.querySelector('[data-fx-part="media"]'), copy = s.querySelector('[data-fx-part="copy"]'), veil = s.querySelector('[data-fx-part="veil"]');
        const tl = gsap.timeline({
          defaults: { ease: "none", duration: 1 },
          scrollTrigger: { trigger: s, scroller, start: "bottom bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
        });
        tl.fromTo(s, { yPercent: 0 }, { yPercent: push });
        if (media) tl.fromTo(media, { rotate: 0, yPercent: 0 }, { rotate: tilt, yPercent: lift }, "<");
        if (copy) tl.fromTo(copy, { yPercent: 0 }, { yPercent: copyLift }, "<");
        if (veil) tl.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.5 }, "<+=0.5");
      });
    });
    return () => mm.revert();
  });
})();
