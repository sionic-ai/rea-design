(() => {
  // Horizontal scroll: pins when the panel top touches the top of the screen, and while scrolling by (strip width − screen width) pushes the strip left by that much (no curve).
  // Media inside the strip grows from the from-scale to 1 while its left edge moves from the right edge of the screen (left 100%) to the center (left 50%) (containerAnimation, scrub 1)
  kfFx.register("hscroll-scale-pin", (el, { options, reduce, scroller }) => {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const track = el.querySelector('[data-fx-part="track"]');
    if (!track || reduce) return;
    const min = +(options.min || 820);
    const from = +(options.from ?? 0.7);
    const scrubRaw = options.scrub ?? "true";
    const scrub = scrubRaw === "true" ? true : +scrubRaw;
    const mediaScrub = +(options["media-scrub"] ?? 1);
    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${min}px)`, () => {
      const clientW = () => (scroller ? scroller.clientWidth : document.documentElement.clientWidth);
      const panel = gsap.to(track, {
        x: () => -(track.scrollWidth - clientW()),
        ease: "none",
        scrollTrigger: {
          trigger: el, start: "top top", end: () => "+=" + Math.max(0, track.scrollWidth - innerWidth),
          pin: true, scrub, anticipatePin: 1, invalidateOnRefresh: true, ...(scroller && { scroller }),
        },
      });
      track.querySelectorAll('[data-fx-part="media"]').forEach((m) => {
        gsap.from(m, { scale: from, ease: "none", scrollTrigger: { trigger: m, containerAnimation: panel, start: options["media-start"] || "left 100%", end: options["media-end"] || "left 50%", scrub: mediaScrub } });
      });
      const ro = new ResizeObserver(() => ScrollTrigger.refresh());
      ro.observe(track);
      return () => ro.disconnect();
    });
    return () => mm.revert();
  });
})();
