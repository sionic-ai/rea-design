// With the photo inside the cell enlarged by scale, it drifts yPercent from → to, from when the cell enters at the screen bottom until it exits at the top (scrub 1, follows 1 second late).
// Moves only within the enlarged margin so the cell edges never go empty. With no media child, the element itself flows (keeping its size, like the dark circle decoration)
(() => {
  kfFx.register("held-zoom-parallax", (el, { options, reduce, scroller }) => {
    const media = el.querySelector('[data-fx-part="media"]');
    const target = media || el;
    const scale = +(options.scale ?? (media ? 1.18 : 1));
    const from = +(options.from ?? 0), to = +(options.to ?? -9);
    const scrub = options.scrub === "true" ? true : +(options.scrub ?? 1);
    // Brand circle stage: while passing through the section (trigger) it widens horizontally by widen times as it floats up — axis·range differ per site so they are taken as options
    const widen = options.widen != null ? +options.widen : null;
    const trigger = (options.trigger && el.closest(options.trigger)) || el;
    if (options.origin) gsap.set(target, { transformOrigin: options.origin });
    gsap.registerPlugin(ScrollTrigger);
    if (scale !== 1) gsap.set(target, { scale });
    const mm = gsap.matchMedia();
    if (!reduce) mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(target, { yPercent: from, ...(widen != null && { scaleX: scale }) }, {
        yPercent: to, ease: "none", ...(widen != null && { scaleX: widen }),
        scrollTrigger: { trigger, ...(scroller && { scroller }), start: options.start || "top bottom", end: options.end || "bottom top", scrub, invalidateOnRefresh: true },
      });
    });
    return () => { mm.revert(); gsap.set(target, { clearProps: "transform" }); };
  });
})();
