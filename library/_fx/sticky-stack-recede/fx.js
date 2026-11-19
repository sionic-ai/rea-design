(() => {
  kfFx.register("sticky-stack-recede", (el, { options, reduce, scroller }) => {
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (cards.length < 2 || reduce || !window.ScrollTrigger) return;

    // Values are px at the base width (base) — they shrink and grow in proportion to window width (original 1600 base, .64–1.6×)
    const base = +(options.base ?? 0);
    const px = (v) => (base ? v * Math.min(1.6, Math.max(0.64, innerWidth / base)) : v);
    const top = +(options.top ?? 50), from = +(options.from ?? 419), lift = +(options.lift ?? 50);
    const scaleStep = +(options.scale ?? 0.05), scaleMin = +(options["scale-min"] ?? 0.85);
    const fadeStep = +(options.fade ?? 0.25), fadeMin = +(options["fade-min"] ?? 0.25);
    const blurStep = +(options.blur ?? 2), blurMax = +(options["blur-max"] ?? 6);

    el.style.setProperty("--fx-stack-top", `${px(top)}px`);
    cards.forEach((c, i) => { c.style.zIndex = String(i + 2); });

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      for (let a = 0; a < cards.length - 1; a++) {
        for (let b = a + 1; b < cards.length; b++) {
          const k0 = b - a - 1, k1 = k0 + 1;
          const look = (k) => {
            const v = { opacity: Math.max(fadeMin, 1 - k * fadeStep), scale: Math.max(scaleMin, 1 - k * scaleStep), y: () => -px(k * lift) };
            if (blurStep) v.filter = () => `blur(${px(Math.min(blurMax, k * blurStep))}px)`;
            return v;
          };
          gsap.fromTo(cards[a], look(k0), {
            ...look(k1),
            ease: "none",
            force3D: true,
            immediateRender: false,
            scrollTrigger: { trigger: cards[b], scroller, start: () => `top top+=${px(from)}`, end: () => `top top+=${px(top)}`, scrub: true, invalidateOnRefresh: true },
          });
        }
      }
    });

    return () => {
      mm.revert();
      el.style.removeProperty("--fx-stack-top");
      cards.forEach((c) => { c.style.zIndex = ""; gsap.set(c, { clearProps: "filter,opacity,transform" }); });
    };
  });
})();
