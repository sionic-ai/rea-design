// Several sentences stacked in the same spot are split into lines, the section stays pinned at screen center tied to scroll, and the earlier sentence’s lines flip away at −105° on the Y axis,
// The next sentence lines turn in from 105° to 0° — as if the lines were attached around a cylinder 620px behind the origin.
// Original values (Agency intro sentence): perspective 1600 (phone 800) · origin 50% 50% −620px · 1 beat power2.inOut · .12 per line · .6-beat pause between sentences · scrub .6
// · Fixed length = (.6 + (n−1) + (n−2)×.6 + .6) × screen height × .58 (phone .34).
(() => {
  kfFx.register("cylinder-line-swap", (el, { options, reduce, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const texts = [...el.querySelectorAll('[data-fx-part="text"]')];
    if (texts.length < 2 || !window.SplitText) return;
    const ANG = +(options.angle ?? 105), DEPTH = +(options.depth ?? 620), EACH = +(options.each ?? 0.12), REST = +(options.rest ?? 0.6), SCRUB = +(options.scrub ?? 0.6);
    const splits = texts.map((t) => SplitText.create(t, { type: "lines", linesClass: "fx-cyl-line" }));
    if (reduce) { gsap.set(texts.slice(1), { opacity: 0 }); return () => splits.forEach((s) => s.revert()); }
    const mm = gsap.matchMedia();
    mm.add({ phone: "(max-width: 767px)", wide: "(min-width: 768px)" }, (ctx) => {
      const k = ctx.conditions.phone ? +(options["phone-length"] ?? 0.34) : +(options.length ?? 0.58);
      const n = splits.length, total = REST + (n - 1) + (n - 2) * REST + REST;
      gsap.set(texts, { opacity: 1 });
      splits.forEach((s, i) => gsap.set(s.lines, { transformOrigin: `50% 50% -${DEPTH}px`, rotationY: i ? ANG : 0 }));
      // pin: parent pins the whole panel (the parent) holding the sentence — the original stops together with the gray panel
      const box = options.pin === "parent" ? el.parentElement : el;
      const tl = gsap.timeline({ defaults: { ease: options.ease || "power2.inOut", duration: 1 }, scrollTrigger: { trigger: box, ...(scroller && { scroller }), start: "center center", end: () => `+=${total * k * innerHeight}`, pin: options.pin === "off" ? false : box, scrub: SCRUB, invalidateOnRefresh: true } });
      splits.forEach((s, i) => { if (!i) return; tl.to(splits[i - 1].lines, { rotationY: -ANG, stagger: EACH }, i === 1 ? REST : `+=${REST}`).to(s.lines, { rotationY: 0, stagger: EACH }, "<"); });
      tl.to({}, { duration: REST });
      return () => { tl.scrollTrigger?.kill(); tl.kill(); };
    });
    return () => { mm.revert(); splits.forEach((s) => s.revert()); gsap.set(texts, { clearProps: "opacity" }); };
  });
})();
