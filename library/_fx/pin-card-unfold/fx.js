(() => {
  kfFx.register("pin-card-unfold", (el, { options, reduce, scroller }) => {
    const row = el.querySelector('[data-fx-part="row"]');
    const cards = row ? [...row.querySelectorAll('[data-fx-part="card"]')] : [];
    if (!cards.length || reduce) return;
    const span = +options.span || 3, lead = +(options.lead ?? 0.8), rows = options.rows || "50% 50%", zoom = +(options.zoom ?? 1.3);
    const shade = el.querySelector('[data-fx-part="shade"]');
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (hover: hover)", () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, scroller, start: "top top", end: () => "+=" + el.offsetWidth * span, pin: true, scrub: 0.5, invalidateOnRefresh: true } });
      tl.to(cards, { xPercent: -100 * (cards.length - lead), ease: "none", duration: 2 });
      shade && tl.to(shade, { opacity: 0.6, ease: "none", duration: 2 }, "<");
      cards.forEach((card) => {
        const img = card.querySelector('[data-fx-part="img"] > *'), text = [...card.querySelectorAll('[data-fx-part="text"]')];
        const c = gsap.timeline({ paused: true });
        text.forEach((t, i) => c.from(t, i ? { opacity: 0, y: 10, duration: 0.5 } : { filter: "blur(10px)", opacity: 0, y: 10, duration: 0.5 }, i > 1 ? "-=0.5" : undefined));
        let on = false;
        const s = gsap.timeline({ scrollTrigger: { trigger: card, scroller, containerAnimation: tl, start: "10% 90%", end: "250% right", scrub: 1,
          onUpdate: (st) => { const p = st.progress > 0.2; if (p !== on) { p ? c.timeScale(1).play() : c.timeScale(2).reverse(); on = p; } } } });
        s.from(card, { gridTemplateRows: rows, duration: 1 });
        img && s.from(img, { scale: zoom, duration: 2 }, "-=1");
      });
      return () => tl.scrollTrigger && tl.scrollTrigger.kill();
    });
    return () => mm.revert();
  });
})();
