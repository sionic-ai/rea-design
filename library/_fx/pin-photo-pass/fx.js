(() => {
  // Pins the section to the screen and lifts the scattered photos (photo children) up together — lift distance and pin distance are the same,
  // Since it is ”top edge of the bottom photo − top edge of the section” (original: the eleventh photo), the last photo rises to the section’s top edge and stops.
  // Original gives the timeline no curve, so the tween default curve (power1.out) applies to scroll as is — it passes fast at first and slow at the end.
  kfFx.register("pin-photo-pass", (el, { options, scroller }) => {
    const photos = [...el.querySelectorAll('[data-fx-part="photo"]')];
    if (!photos.length) return;
    gsap.registerPlugin(ScrollTrigger);
    const ease = kfFx.ease(options.ease || "power1.out", "power1.out");
    const lowest = () => photos.reduce((m, p) => Math.max(m, p.offsetTop), 0);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          scroller, trigger: el, start: options.start || "top top", end: () => "+=" + lowest(),
          pin: true, scrub: options.scrub != null ? +options.scrub : 1, invalidateOnRefresh: true,
        },
      });
      tl.to(photos, { y: () => -lowest(), ease, duration: 0.5 });
      const ro = new ResizeObserver(() => ScrollTrigger.refresh());
      ro.observe(el);
      return () => ro.disconnect();
    });
    return () => mm.revert();
  });
})();
