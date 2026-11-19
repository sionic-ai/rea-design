// The section is pinned (card count × screen height × per), and cards waiting below rise one at a time and stack over the previous card.
// A card’s starting position is the css transform (--fx-rise in fx.css) and scroll brings it from there to 0. Later photos rise a little over a longer span while shrinking
(() => {
  kfFx.register("rise-stack-pin", (el, { options, reduce, scroller }) => {
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!cards.length) return;
    const back = el.querySelector('[data-fx-part="back"]');
    const per = +(options.per ?? 1), backLen = +(options.back ?? 4 / 3), min = +options.from || 860;
    // Brand: rises linearly (ease: none) with scrub 1, once fully risen only the neighboring scene name (caption) crossfades for .5 then rests .5
    const captions = [...el.querySelectorAll('[data-fx-part="caption"]')];
    const scrub = options.scrub != null ? +options.scrub : true, fade = +(options.fade ?? 0.5), hold = +(options.hold ?? 0);
    const ease = options.ease ? { ease: options.ease } : {};
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${min}px) and (prefers-reduced-motion: no-preference)`, () => {
      const tl = gsap.timeline({ scrollTrigger: { scroller, trigger: el, start: "top top", end: () => "+=" + innerHeight * per * cards.length, scrub, pin: true, invalidateOnRefresh: true } });
      if (captions.length > 1) gsap.set(captions.slice(1), { opacity: 0 });
      cards.forEach((card, k) => {
        tl.to(card, { y: 0, ...ease });
        if (!captions[k + 1]) return;
        const at = tl.duration();
        tl.to(captions[k], { opacity: 0, duration: fade }, at).to(captions[k + 1], { opacity: 1, duration: fade }, at);
        if (hold > 0) tl.to({}, { duration: hold });
      });
      if (back) gsap.to(back, { yPercent: -5, scale: 1, ease: "power1.out", scrollTrigger: { scroller, trigger: el, start: "top top", end: () => "+=" + innerHeight * per * cards.length * backLen, scrub: true, invalidateOnRefresh: true } });
      return () => { gsap.set([...cards, back].filter(Boolean), { clearProps: "transform" }); if (captions.length) gsap.set(captions, { clearProps: "opacity" }); };
    });
    if (reduce) gsap.set(cards, { y: 0 });
    return () => mm.revert();
  });
})();
