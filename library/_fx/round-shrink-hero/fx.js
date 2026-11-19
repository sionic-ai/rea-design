(() => {
  // The full-bleed hero (video/photo) shrinks over the first 100px of scroll by twice the margin (scale 1 − 2·margin/screen width), the corners round off (--fx-p1),
  // After that, until the first screen is fully gone, the inner video (media) drops 60svh later and the text (content) 20svh later (--fx-p2) — tied directly to scroll (no scrub).
  kfFx.register("round-shrink-hero", (el, { options, reduce, scroller }) => {
    if (!window.ScrollTrigger) return;
    const media = el.querySelector('[data-fx-part="media"]'), content = el.querySelector('[data-fx-part="content"]');
    const margin = +(options.margin ?? 20), corner = +(options.corner ?? 6), span = +(options.span ?? 100);
    const mediaLag = +(options.media ?? 60), contentLag = +(options.content ?? 20);
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${+(options.narrow || 1024) + 1}px) and (prefers-reduced-motion: no-preference)`, () => {
      if (reduce) return;
      const t1 = ScrollTrigger.create({
        trigger: el, ...(scroller && { scroller }), start: "top top", end: `+=${span}`,
        onUpdate: (s) => gsap.set(el, { "--fx-p1": s.progress, scale: 1 - ((2 * margin) / innerWidth) * s.progress, borderRadius: corner * s.progress }),
      });
      const t2 = ScrollTrigger.create({
        trigger: el, ...(scroller && { scroller }), start: `top -${span}px`, end: "bottom top",
        onUpdate: (s) => {
          gsap.set(el, { "--fx-p2": s.progress });
          media && gsap.set(media, { y: (innerHeight * mediaLag * s.progress) / 100 });
          content && gsap.set(content, { y: (innerHeight * contentLag * s.progress) / 100 });
        },
      });
      return () => { t1.kill(); t2.kill(); gsap.set([el, media, content].filter(Boolean), { clearProps: "transform,borderRadius,--fx-p1,--fx-p2" }); };
    });
    return () => mm.revert();
  });
})();
