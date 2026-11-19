(() => {
  // Card stack — each card sticks to the top of the screen (--fx-top), and from when its top edge touches the screen top, over a scroll of its own height it shrinks to .9x around its top edge and darkens to 20% brightness
  // (the next card covers it). The photo inside a card shrinks 1.2 → 1 while the card enters from the screen bottom until it is fully visible
  kfFx.register("sticky-shrink-dim", (el, { options, reduce, scroller }) => {
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!cards.length || reduce) return;
    const scale = +(options.scale ?? 0.9), bright = +(options.bright ?? 0.2), scrub = +(options.scrub ?? 1.5);
    const zoom = +(options.zoom ?? 1.2), zoomScrub = +(options["zoom-scrub"] ?? 1);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      cards.forEach((card) => {
        gsap.timeline({ scrollTrigger: { trigger: card, scroller, scrub, start: "top top" } })
          .fromTo(card, { scale: 1, filter: "brightness(100%)" }, { scale, filter: `brightness(${bright * 100}%)` });
        const media = card.querySelector('[data-fx-part="media"]');
        if (media) gsap.timeline({ scrollTrigger: { trigger: media, scroller, scrub: zoomScrub, start: "top bottom", end: "bottom bottom" } }).fromTo(media, { scale: zoom }, { scale: 1 });
      });
    });
    return () => mm.revert();
  });
})();
