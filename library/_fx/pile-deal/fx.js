(() => {
  // Cards start from a tilted pile in the middle of the board and drop into place at set intervals, beginning with the top (last) card — pinned and tied to scroll
  // pin: off means no pinning, the panel is laid in place while it passes from 85% → 15% of the screen (Brand six samples — .08 apart starting from the first one, the stack is the first row’s height)
  kfFx.register("pile-deal", (el, { options, scroller }) => {
    const board = el.querySelector('[data-fx-part="board"]') || el;
    const cards = [...board.querySelectorAll('[data-fx-part="card"]')];
    if (!cards.length) return;
    gsap.registerPlugin(ScrollTrigger);
    const turns = String(options.turns ?? "-11 7 -4 9 -7 4").split(/[\s,]+/).filter(Boolean).map(Number);
    const gap = +(options.gap ?? 0.42), scale = +(options.scale ?? 0.66), length = +(options.length ?? 1.7), hold = +(options.hold ?? 0.5);
    const dur = +(options.dur ?? 1), pinned = options.pin !== "off", first = options.order === "first", top = options.pile === "top";
    const ease = kfFx.ease(options.ease || "power2.inOut", "power2.inOut");
    const view = () => (scroller ? scroller.clientHeight : innerHeight);
    // offsetLeft·offsetTop ignore transforms, so when re-measuring they are measured from the resting position wherever the card has flown to
    const pileX = (c) => board.clientWidth / 2 - (c.offsetLeft + c.offsetWidth / 2);
    const pileY = (c) => (top ? cards[0].offsetTop + cards[0].offsetHeight / 2 : board.clientHeight / 2) - (c.offsetTop + c.offsetHeight / 2);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const st = pinned
        ? { start: "top top", end: () => "+=" + Math.round(view() * length), pin: true }
        : { start: options.start || "top 85%", end: options.end || "top 15%" };
      const deal = gsap.timeline({ scrollTrigger: { trigger: el, ...(scroller && { scroller }), ...st, scrub: true, invalidateOnRefresh: true } });
      (first ? cards.slice() : cards.slice().reverse()).forEach((c, order) => {
        const i = cards.indexOf(c);
        deal.fromTo(c,
          { x: () => pileX(c), y: () => pileY(c), rotation: turns[i % turns.length] || 0, scale, ...(first && { zIndex: cards.length - i }) },
          { x: 0, y: 0, rotation: 0, scale: 1, duration: dur, ease }, order * gap);
      });
      if (pinned) deal.to({}, { duration: hold });
    });
    // If it is pinned and then removed from the document, only the pin-spacer remains — clear the empty spacer first
    return () => { if (!el.isConnected) ScrollTrigger.getAll().forEach((t) => t.pin === el && t.spacer?.remove()); mm.revert(); };
  });
})();
