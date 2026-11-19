// Pins this section to the screen while the next section passes (no offset — the next section covers it as it passes over the top), and meanwhile the circle at the section bottom spreads with --fx-progress 0→1
(() => {
  kfFx.register("circle-spread-pin", (el, { options, reduce, scroller }) => {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const next = options.pin === "off" ? null : el.nextElementSibling;
    const passer = next || el;
    if (reduce) { el.style.setProperty("--fx-progress", 1); return () => el.style.removeProperty("--fx-progress"); }
    if (options.max) el.style.setProperty("--fx-max", options.max + "%");
    const ctx = gsap.context(() => {
      if (next) ScrollTrigger.create({ trigger: next, pin: el, start: "top bottom", end: "bottom top", pinSpacing: false, scroller });
      gsap.fromTo(el, { "--fx-progress": 0 }, {
        "--fx-progress": 1,
        ease: options.ease || "none",
        scrollTrigger: { trigger: passer, start: options.start || (next ? "top bottom-=50%" : "top top"), end: options.length || "+=200%", scrub: true, scroller },
      });
    });
    return () => { ctx.revert(); el.style.removeProperty("--fx-progress"); el.style.removeProperty("--fx-max"); };
  });
})();
