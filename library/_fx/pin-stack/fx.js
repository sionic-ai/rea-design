(() => {
  kfFx.register("pin-stack", (fold, { options, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const cards = [...fold.querySelectorAll('[data-fx-part="card"]')], mm = gsap.matchMedia();
    mm.add(`(prefers-reduced-motion: no-preference) and (min-width: ${+(options.min ?? 810)}px)`, () => {
      // first: stay — the first card stays in place and from the second on they rise and cover it · length — fixed length in px (brand 3000) · scrub and ease vary per original
      const moving = options.first === "stay" ? cards.slice(1) : cards;
      const length = () => (options.length ? +options.length : Math.round(+(options.per || 0.6) * moving.length * fold.clientHeight));
      const scrub = options.scrub ? +options.scrub : true;
      const tl = gsap.timeline({ defaults: { ease: kfFx.ease(options.ease || "none", "none") }, scrollTrigger: { trigger: fold, ...(scroller && { scroller }), start: "top top", end: () => `+=${length()}`, pin: true, anticipatePin: 1, scrub, invalidateOnRefresh: true } });
      moving.forEach((c) => tl.fromTo(c, { y: () => fold.clientHeight - c.offsetTop }, { y: 0, duration: 1 }));
    });
    // When a pinned element is pulled from the document only the pin-spacer remains, and putting it back makes ScrollTrigger re-insert the removed element in place — so clear the empty spacer first
    return () => { if (!fold.isConnected) ScrollTrigger.getAll().forEach((t) => t.pin === fold && t.spacer?.remove()); mm.revert(); };
  });
})();
