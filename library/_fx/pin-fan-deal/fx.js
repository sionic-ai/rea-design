// Unfold from a point: while the section is pinned for 1 screen, the cards overlap at a point bottom center of the screen at ±14°, then
// In step with scroll (scrub .6), they fly in at .3 intervals to sit in their own place and tilt — the 8 cards of a Brand site’s ”why parents choose us” section
(() => {
  kfFx.register("pin-fan-deal", (el, { options, reduce, scroller }) => {
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!cards.length || reduce || !window.ScrollTrigger) return;
    const list = cards[0].offsetParent === el ? cards[0].parentElement : cards[0].parentElement;
    const tilts = cards.map((c) => parseFloat(getComputedStyle(c).getPropertyValue("--fx-tilt")) || parseFloat(getComputedStyle(c).rotate) || 0);
    cards.forEach((c) => (c.style.rotate = "0deg"));
    const spin = +(options.spin ?? 14), from = +(options.scale ?? 0.92), each = +(options.each ?? 0.3), dur = +(options.dur ?? 1.1), scrub = +(options.scrub ?? 0.6);
    const ease = kfFx.ease(options.ease || "power3.out", "power3.out");
    const listTop = () => { let t = 0; for (let n = list; n && n !== el; n = n.offsetParent) t += n.offsetTop; return t; };
    const centre = (c) => { let x = c.offsetWidth / 2, y = c.offsetHeight / 2; for (let n = c; n && n !== el; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; } return { x, y }; };
    const lift = () => { const top = listTop(), fit = innerHeight - (top + list.offsetHeight) - 40; return Math.min(0, Math.max(40 - top, fit)); };
    const point = () => ({ x: el.offsetWidth / 2, y: innerHeight + cards[0].offsetHeight - lift() });
    const ctx = gsap.context(() => {
      if (options.pin !== "off") ScrollTrigger.create({ trigger: el, scroller, start: () => `top ${lift()}px`, end: () => `+=${innerHeight}`, pin: true, anticipatePin: 1, invalidateOnRefresh: true });
      const tl = gsap.timeline({ defaults: { overwrite: "auto" }, scrollTrigger: { trigger: el, scroller, start: () => `top ${innerHeight - listTop()}px`, end: () => `+=${innerHeight - listTop() - lift() + innerHeight}`, scrub, invalidateOnRefresh: true } });
      tl.set(cards, { immediateRender: true, x: (i, c) => point().x - centre(c).x, y: (i, c) => point().y - centre(c).y, rotation: (i) => spin * (i % 2 ? 1 : -1), scale: from, autoAlpha: 0 });
      cards.forEach((c, i) => {
        tl.to(c, { x: 0, y: 0, rotation: tilts[i], scale: 1, duration: dur, ease }, each * i);
        tl.to(c, { autoAlpha: 1, duration: 0.2 * dur, ease: "none" }, each * i);
      });
    }, el);
    return () => { ctx.revert(); cards.forEach((c) => c.style.removeProperty("rotate")); };
  });
})();
