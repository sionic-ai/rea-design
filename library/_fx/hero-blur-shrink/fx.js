// The screen-attached Hero melts away over one screen of scroll — photo 1→.8x · blur 0→60px, the center logo shrinks to 30% and blurs 60px, and the whole panel becomes transparent (fv pattern)
(() => {
  kfFx.register("hero-blur-shrink", (el, { options, reduce, scroller }) => {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const image = el.querySelector('[data-fx-part="image"]');
    const logo = el.querySelector('[data-fx-part="logo"]');
    const span = +(options.span ?? 1);
    const blur = +(options.blur ?? 60);
    const imageScale = +(options["image-scale"] ?? 0.8);
    const logoScale = +(options["logo-scale"] ?? 0.3);
    const fade = options.fade !== "off";
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const st = { trigger: document.documentElement, scroller: scroller || undefined, start: 0, end: () => innerHeight * span, scrub: true, invalidateOnRefresh: true };
      if (fade) gsap.to(el, { opacity: 0, ease: "none", scrollTrigger: st });
      if (logo) gsap.to(logo, { scale: logoScale, filter: `blur(${blur}px)`, ease: "none", scrollTrigger: { ...st } });
      if (image) gsap.fromTo(image, { scale: 1, filter: "blur(0px)" }, { scale: imageScale, filter: `blur(${blur}px)`, ease: "none", scrollTrigger: { ...st } });
    });
    return () => mm.revert();
  });
})();
