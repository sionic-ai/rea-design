(() => {
  kfFx.register("fan-pin-cards", (el, { options, reduce, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!cards.length) return;
    const copy = el.querySelector('[data-fx-part="copy"]');
    const spread = +(options.spread ?? 4), radius = +(options.radius ?? 1.25), from = +(options.from ?? 0.55);
    const per = +(options.per ?? 0.75), fade = +(options.fade ?? 0.25), ease = kfFx.ease(options.ease || "power1.out", "power1.out");
    const angle = (i) => (i - (cards.length - 1) / 2) * spread;
    // Original geometry: the card sits on top of a circle of radius R and rotates by a along with the circle, then rotates a more by itself — position follows the circle, tilt is 2a
    const place = (c, a, p) => {
      const R = innerWidth * radius, rad = (a * Math.PI) / 180;
      const start = innerHeight * from + c.offsetHeight / 2;
      gsap.set(c, { xPercent: -50, yPercent: -50, translate: "none", x: R * Math.sin(rad), y: start * (1 - p) + R * (1 - Math.cos(rad)), rotation: 2 * a });
    };
    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${+(options.min || 768)}px)`, () => {
      if (reduce) { cards.forEach((c, i) => place(c, angle(i), 1)); if (copy) gsap.set(copy, { opacity: 0 }); return; }
      const len = () => per * cards.length * innerHeight;
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: "top top", end: () => "+=" + len(), pin: true, anticipatePin: 1, scrub: true, invalidateOnRefresh: true } });
      if (copy) tl.to(copy, { opacity: 0, ease: "none", duration: fade * cards.length }, 0);
      cards.forEach((c, i) => {
        const st = { p: 0 };
        place(c, 0, 0);
        tl.to(st, { p: 1, duration: 1, ease, onUpdate: () => place(c, angle(i) * st.p, st.p) }, i);
      });
      tl.set({}, {}, cards.length);
      const ro = new ResizeObserver(() => ScrollTrigger.refresh());
      ro.observe(el);
      return () => { ro.disconnect(); gsap.set(cards, { clearProps: "transform,translate" }); if (copy) gsap.set(copy, { clearProps: "opacity" }); };
    });
    return () => { if (!el.isConnected) ScrollTrigger.getAll().forEach((t) => t.pin === el && t.spacer?.remove()); mm.revert(); };
  });
})();
