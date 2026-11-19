(() => {
  // A shape straddling the section boundary (arch·bowl) is tied to scroll, starts small (.3) and grows to full size as it crosses the boundary
  kfFx.register("scrub-grow", (el, { options, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const from = +(options.from ?? 0.3);
    // fade: initial opacity (fades 0→1 together only when present) · scrub: follow-up lag (s) · trigger: if parent, measured against the parent section (when only growing inside the panel)
    const fade = options.fade != null ? +options.fade : null;
    const scrub = options.scrub != null ? +options.scrub : true;
    // If it’s any other text, read it as css and find it in the document — used when growing the next section in the spot where the previous section (video) passes. If not found, itself
    const trigger = options.trigger === "parent" ? el.parentElement || el : (options.trigger && document.querySelector(options.trigger)) || el;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (options.origin) gsap.set(el, { transformOrigin: options.origin });
      gsap.fromTo(el, { scale: from, ...(fade != null && { opacity: fade }) }, {
        scale: 1, ...(fade != null && { opacity: 1 }), ease: "none",
        scrollTrigger: { trigger, ...(scroller && { scroller }), start: options.start || "bottom bottom", end: options.end || "bottom 35%", scrub },
      });
    });
    return () => mm.revert();
  });
})();
