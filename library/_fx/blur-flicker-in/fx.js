// Each piece takes a delay table via data-delay — write the original delays (in seconds) as they are, the part converts them to (delay − shift) × a per-type multiplier, puts them on one timeline, then plays the whole thing at speed.
(() => {
  kfFx.register("blur-flicker-in", (el, { options, reduce, scroller }) => {
    const parts = [...el.querySelectorAll("[data-fx-part=piece]")];
    if (!parts.length) return;
    const fxCtx = gsap.context(() => {
      if (reduce) { gsap.set(parts, { opacity: 1, filter: "none" }); return; }
      const shift = +(options.shift ?? 0.7), speed = +options.speed || 1.9;
      const kFlicker = +(options["k-flicker"] ?? 0.75), kFade = +(options["k-fade"] ?? 0.7);
      const tl = gsap.timeline({ paused: true, delay: +(options.delay ?? 0) });
      parts.forEach((p) => {
        const fade = p.dataset.look === "fade";
        const at = Math.max(0, Math.max(0, +(p.dataset.delay ?? shift) - shift) * (fade ? kFade : kFlicker) - +(p.dataset.lead ?? 0));
        if (fade) tl.fromTo(p, { autoAlpha: 0, filter: "blur(8px)" }, { autoAlpha: 1, filter: "blur(0px)", duration: 0.57, ease: "power1.inOut" }, at);
        else tl.fromTo(p, { opacity: 0, filter: "blur(8px) brightness(1)" }, {
          keyframes: [
            { opacity: 1, filter: "blur(0px) brightness(2.4)", duration: 0.3 },
            { opacity: 0.2, filter: "blur(1.5px) brightness(1)", duration: 0.1 },
            { opacity: 1, filter: "blur(0px) brightness(1.6)", duration: 0.15 },
            { opacity: 1, filter: "blur(0px) brightness(1)", duration: 0.2 },
          ],
          ease: "none",
        }, at);
      });
      tl.timeScale(speed);
      if (options.on === "view") {
        gsap.registerPlugin(ScrollTrigger);
        gsap.set(parts, { opacity: 0 });
        ScrollTrigger.create({ scroller, trigger: el, start: options.start || "top 80%", once: true, onEnter: () => tl.play() });
      } else tl.play();
    }, el);
    return () => fxCtx.revert();
  });
})();
