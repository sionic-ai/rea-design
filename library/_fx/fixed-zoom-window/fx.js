// A screen-height cell (window) cuts out and reveals a pinned photo (clip-path inset(0) + inner position: fixed), while the cell leaves the top of the screen (top top → bottom top)
// The photo returns to its size and place from 1.2x and 40% pushed down (scrub, no curve) — the original moves only on wide screens (1025px and up).
(() => {
  kfFx.register("fixed-zoom-window", (el, { options, reduce, scroller }) => {
    const media = el.querySelector('[data-fx-part="media"]');
    if (!media || !window.ScrollTrigger || reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const zoom = +(options.zoom ?? 1.2), y = String(options.y ?? "40%"), min = +(options.min ?? 1024);
    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${min + 1}px)`, () => {
      gsap.fromTo(media, { scale: zoom, y }, { scale: 1, y: "0%", ease: "none", scrollTrigger: { trigger: el, scroller, start: options.start || "top top", end: options.end || "bottom top", scrub: true } });
    });
    return () => mm.revert();
  });
})();
