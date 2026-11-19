// While the hero frame stays stuck to the screen (not sharing space with the content behind) for one screen of scroll, the cover panel that sat at the bottom inside the same frame rises by its own height and covers
// The back image recedes with 40px blur·.5 opacity·1.05 scale while the logo shrinks to .9 (.9 · .5 share, the last .5 share holds). Right after attaching, the image may also sharpen over 2.5s from brightness 3·blur 4px·1.05 scale (in)
(() => {
  kfFx.register("pin-cover-blur", (el, { options, reduce, scroller }) => {
    const cover = el.querySelector('[data-fx-part="cover"]');
    const media = el.querySelector('[data-fx-part="media"]');
    if (!cover || !media) return;
    const logo = el.querySelector('[data-fx-part="logo"]');
    const blur = +(options.blur ?? 40), dim = +(options.dim ?? 0.5), grow = +(options.grow ?? 1.05), shrink = +(options.shrink ?? 0.9);
    let tl, intro;
    if (options.in === "on" && !reduce) intro = gsap.fromTo(media, { filter: "brightness(3) blur(4px)", scale: 1.05 }, { filter: "brightness(1) blur(0px)", scale: 1, duration: +(options["in-dur"] ?? 2.5), ease: "power2.out" });
    if (!reduce) {
      gsap.registerPlugin(ScrollTrigger);
      tl = gsap.timeline({ scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: "top top", end: "bottom top", scrub: true, pin: true, pinSpacing: options.spacing === "on" } });
      tl.to(cover, { yPercent: -100, duration: 0.9, ease: "none" })
        .to(media, { filter: `blur(${blur}px)`, opacity: dim, scale: grow, duration: 0.9, ease: "none" }, 0);
      if (logo) tl.to(logo, { scale: shrink, duration: 0.5, ease: "none" }, 0);
      tl.to({}, { duration: 0.5 });
    }
    return () => { intro?.kill(); tl?.scrollTrigger?.kill(); tl?.kill(); gsap.set([cover, media, logo].filter(Boolean), { clearProps: "transform,filter,opacity" }); };
  });
})();
