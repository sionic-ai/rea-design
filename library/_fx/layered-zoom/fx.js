// A small photo inside the panel grows on scroll to cover it — the same photo is layered behind, growing slightly earlier and larger than the front layer, giving depth like stepping into a room
(() => {
  kfFx.register("layered-zoom", (el, { options, reduce, scroller }) => {
    const q = (role) => [...el.querySelectorAll(`[data-fx-part="${role}"]`)];
    const photo = q("photo");
    if (!photo.length) return;
    const layers = q("layer"), reveal = q("reveal");
    const from = +(options.from ?? 0.65), step = +(options.step ?? 0.25), lead = +(options.lead ?? 0.1);
    const ease = kfFx.ease(options.ease || "power2.out", "power2.out");
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (reduce) return;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, scroller, start: options.start || "top -50%", end: options.end || "bottom bottom", scrub: +(options.scrub ?? 0.8), invalidateOnRefresh: true },
      });
      // Back layers start earlier by lead and grow larger by step — the front photo starts last and settles at 1×
      const n = layers.length;
      tl.fromTo(photo, { scale: from }, { scale: 1, duration: 3, ease }, n * lead);
      layers.forEach((l, i) => tl.fromTo(l, { scale: from }, { scale: 1 + step * (i + 1), duration: 3, ease }, (n - 1 - i) * lead));
      if (reveal.length) tl.fromTo(reveal, { opacity: 0 }, { opacity: 1, duration: 0.5, ease }, 1);
      return () => tl.scrollTrigger?.kill();
    });
    return () => { mm.revert(); if (el.isConnected) gsap.set([...photo, ...layers, ...reveal], { clearProps: "transform,opacity" }); };
  });
})();
