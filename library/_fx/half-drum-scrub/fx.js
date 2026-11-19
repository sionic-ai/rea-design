(() => {
  kfFx.register("half-drum-scrub", (el, { options, reduce, scroller }) => {
    const drum = el.querySelector('[data-fx-part="drum"]') || el;
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length || !window.ScrollTrigger) return;
    const from = +(options.from ?? -80), to = +(options.to ?? 270), k = +(options.radius ?? 1 / 4.8), span = +options.span || 2500;
    const place = () => {
      const R = innerWidth * k, n = items.length;
      items.forEach((it, t) => gsap.set(it, { x: -it.offsetWidth / 2, yPercent: -50, y: R * Math.sin(t * (Math.PI / n)), z: R * Math.cos(t * (Math.PI / n)), rotationX: -t * (180 / n) }));
    };
    place();
    const ro = new ResizeObserver(place); ro.observe(el);
    if (reduce) { gsap.set(drum, { rotationX: 0 }); return () => { ro.disconnect(); gsap.set([drum, ...items], { clearProps: "transform" }); }; }
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.timeline({ scrollTrigger: { trigger: el, scroller: scroller || undefined, start: "top top", end: `+=${span}`, scrub: 1, pin: true } })
        .fromTo(drum, { rotationX: from }, { rotationX: to, duration: 2 }, 0);
    });
    return () => { ro.disconnect(); mm.revert(); gsap.set([drum, ...items], { clearProps: "transform" }); };
  });
})();
