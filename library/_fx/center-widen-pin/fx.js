(() => {
  // Center column spread — during the attached element (long track) the stage (data-fx-part="stage") is fixed,
  // The center column (col) spreads from its initial width and left position to 100vw over dist screens of scroll, with no curve.
  // Scroll down 20px and both sides (side, data-side="left|right") slides 50% outward over .5s and disappears,
  // After expanding, the image inside the pillar (media) sweeps down to the bottom end (pan %).
  kfFx.register("center-widen-pin", (el, { options, reduce, scroller }) => {
    const stage = el.querySelector('[data-fx-part="stage"]');
    const col = el.querySelector('[data-fx-part="col"]');
    if (!stage || !col) return;
    const sides = [...el.querySelectorAll('[data-fx-part="side"]')];
    const media = el.querySelector('[data-fx-part="media"]');
    const from = +(options.from ?? 41.14), left = +(options.left ?? 40), dist = +(options.dist ?? 1), pan = +(options.pan ?? 100);
    const dur = +(options.dur ?? 0.5), ease = kfFx.ease(options.ease || "0.55,0.05,0.22,0.99", "power2.inOut");
    if (reduce || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const trig = (o) => ({ trigger: el, ...(scroller && { scroller }), invalidateOnRefresh: true, ...o });
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      ScrollTrigger.create(trig({ start: "top top", end: "bottom bottom", pin: stage, pinSpacing: false }));
      gsap.fromTo(col, { left: `${left}vw`, width: `${from}vw` }, { left: 0, width: "100vw", ease: "none", scrollTrigger: trig({ start: "top top", end: () => "+=" + innerHeight * dist, scrub: true }) });
      if (sides.length) {
        const out = gsap.timeline({ paused: true });
        sides.forEach((s) => out.to(s, { xPercent: s.dataset.side === "right" ? 50 : -50, autoAlpha: 0, duration: dur, ease }, 0));
        ScrollTrigger.create(trig({ start: "top+=20 top", end: "bottom top", onEnter: () => out.play(), onLeaveBack: () => out.reverse() }));
      }
      if (media && pan) {
        const isImg = /^(IMG|VIDEO)$/.test(media.tagName);
        gsap.to(media, { [isImg ? "objectPosition" : "backgroundPosition"]: `50% ${pan}%`, ease: "none", scrollTrigger: trig({ start: () => "top+=" + innerHeight * (dist + 0.5) + " top", end: "bottom bottom", scrub: true }) });
      }
    });
    return () => mm.revert();
  });
})();
