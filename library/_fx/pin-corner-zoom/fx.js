// Pin the picture frame inside the section and rest for 2 beats, then during 1 beat the overlay (like a speech bubble) turns on while the picture grows over 3 beats and is pulled toward one side bottom, then holds for 5 beats.
// Pinning without added spacing — the section holds the full height of the picture cell and text cell vertically, so as the picture is dragged away the text rises into the vacated space.
(() => {
  kfFx.register("pin-corner-zoom", (el, { options, reduce, scroller }) => {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const pin = el.querySelector('[data-fx-part="pin"]');
    const zoom = el.querySelector('[data-fx-part="zoom"]') || pin;
    const over = el.querySelector('[data-fx-part="overlay"]');
    if (!pin || reduce) { if (over && reduce) gsap.set(over, { opacity: 1 }); return () => over && gsap.set(over, { clearProps: "opacity" }); }
    const wide = options.wide || "(min-width: 1024px)";
    const mm = gsap.matchMedia();
    mm.add({ wide, narrow: `not all and ${wide}` }, (ctx) => {
      const scale = ctx.conditions.wide ? +(options.scale ?? 1.5) : +(options["scale-narrow"] ?? 1.2);
      const fx = +(options.x ?? 0.390625), fy = +(options.y ?? 0.3), at = +(options.at ?? 0.5);
      const tl = gsap.timeline({
        defaults: { delay: 0 },
        scrollTrigger: {
          trigger: el, pin, pinSpacing: false, start: () => `${at * innerHeight} center`, end: options.end || "bottom bottom",
          invalidateOnRefresh: true, anticipatePin: 1, scrub: options.scrub === "true" ? true : +(options.scrub ?? 1.1), ...(scroller && { scroller }),
        },
      });
      tl.to({}, { duration: +(options.hold ?? 2) });
      if (over) tl.to(over, { opacity: 1, duration: +(options.show ?? 1) });
      tl.to(zoom, { scale, x: () => fx * innerWidth, y: () => fy * innerHeight, duration: +(options.move ?? 3) }, over ? "<" : ">");
      tl.to({}, { duration: +(options.rest ?? 5) });
      return () => { gsap.set([zoom, over].filter(Boolean), { clearProps: "transform,opacity" }); };
    });
    return () => mm.revert();
  });
})();
