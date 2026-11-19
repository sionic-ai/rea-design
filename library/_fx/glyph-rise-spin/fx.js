(() => {
  // Footer wordmark — when the section top reaches screen center (start), letter pieces rise in turn from 1.8x screen height below (1s back.inOut, stagger .05),
  // At the same moment the star pieces spin two turns (back.inOut) for 3s after .2s, shrink to .6x over 2s after a .5s delay, and return to full size in 1s
  kfFx.register("glyph-rise-spin", (el, { options, reduce, scroller }) => {
    const glyphs = [...el.querySelectorAll('[data-fx-part="glyph"], [data-fx-part="star"]')];
    if (!glyphs.length || reduce) return;
    const star = el.querySelector('[data-fx-part="star"]');
    const from = +(options.from ?? 1.8), dur = +(options.dur ?? 1), each = +(options.each ?? 0.05);
    const spin = +(options.spin ?? 720), shrink = +(options.shrink ?? 0.6);
    const ease = !options.ease ? "back.inOut" : /^[\d.,\s-]+$/.test(options.ease) ? kfFx.ease(options.ease, "back.inOut") : options.ease;
    let spinTl;
    const play = () => {
      if (!star) return;
      spinTl?.kill();
      spinTl = gsap.timeline()
        .to(star, { rotate: spin, duration: 3, transformOrigin: "50% 50%", ease: "back.inOut", delay: 0.2 })
        .to(star, { scale: shrink, duration: 2, delay: 0.3, transformOrigin: "50% 50%", ease: "power2.inOut" }, "<")
        .to(star, { scale: 1, duration: 1, transformOrigin: "50% 50%", ease: "back.inOut" }, ">");
    };
    gsap.set(glyphs, { y: () => innerHeight * from });
    const tw = gsap.to(glyphs, {
      y: 0, ease, duration: dur, stagger: each,
      scrollTrigger: { trigger: el, scroller, start: options.start || "top 50%", onEnter: play },
    });
    return () => { spinTl?.kill(); tw.scrollTrigger?.kill(); tw.kill(); gsap.set(glyphs, { clearProps: "transform" }); };
  });
})();
