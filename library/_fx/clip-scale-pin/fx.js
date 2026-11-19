(() => {
  // Background photo panel: pins the panel from when its top touches the top of the screen until its bottom touches the screen bottom, and media scales from from x → 1 around the bottom center,
  // The clip below opens clip% → 0 (scrub 1, GSAP default power1.out). If the panel is shorter than the screen, it runs for the extra scroll equal to the panel height
  kfFx.register("clip-scale-pin", (el, { options, reduce, scroller }) => {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = el.querySelector('[data-fx-part="media"]');
    if (!media) return;
    if (reduce) return () => gsap.set(media, { clearProps: "transform,--fx-clip" });
    const from = +(options.from ?? 0.8), clip = +(options.clip ?? 10);
    const scrubRaw = options.scrub ?? "1";
    const scrub = scrubRaw === "true" ? true : +scrubRaw;
    gsap.set(media, { transformOrigin: options.origin || "bottom center" });
    const tw = gsap.fromTo(media, { scale: from, "--fx-clip": clip + "%" }, {
      scale: 1, "--fx-clip": "0%", ease: kfFx.ease(options.ease || "power1.out", "power1.out"),
      scrollTrigger: {
        trigger: el, start: "top top",
        end: () => (el.offsetHeight > innerHeight ? "bottom bottom" : "+=" + el.offsetHeight),
        scrub, pin: options.pin !== "false", invalidateOnRefresh: true, ...(scroller && { scroller }),
      },
    });
    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(el);
    return () => { ro.disconnect(); tw.scrollTrigger?.kill(); tw.kill(); if (media.isConnected) gsap.set(media, { clearProps: "transform,--fx-clip" }); };
  });
})();
