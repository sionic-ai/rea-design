(() => {
  // Circle cover — pin the section, pause, then grow the cover panel as a circle. When fully covered, after rises
  kfFx.register("circle-cover-pin", (el, { options, reduce, scroller }) => {
    const cover = el.querySelector(':scope > [data-fx-part="cover"]');
    if (!cover) return;
    const after = cover.querySelectorAll('[data-fx-part="after"]');
    const at = options.at || "16% 100%";
    if (reduce) {
      gsap.set(cover, { clipPath: "none" });
      return () => gsap.set(cover, { clearProps: "clipPath" });
    }
    gsap.registerPlugin(ScrollTrigger);
    const length = +(options.length || 3), hold = +(options.hold ?? 0.36), dur = +(options.cover ?? 3);
    // A four-number curve uses CustomEase, otherwise the GSAP name as is
    const ease = /^[\d.,\s-]+$/.test(options.ease || "") ? kfFx.ease(options.ease, "power1.in") : options.ease || "power1.in";
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: "top top", end: () => "+=" + innerHeight * length, pin: true, scrub: true, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      tl.to({}, { duration: hold })
        .fromTo(cover, { clipPath: `circle(0% at ${at})` }, { clipPath: `circle(150% at ${at})`, duration: dur, ease });
      if (after.length) tl.fromTo(after, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.75 }, ">-0.2");
      tl.to({}, { duration: 0.5 });
    });
    return () => { mm.revert(); gsap.set([cover, ...after], { clearProps: "clipPath,opacity,transform" }); };
  });
})();
