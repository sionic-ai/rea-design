(() => {
  // A giant title gathers from wide letter-spacing and transparency into its own spacing — once, when its center reaches 75% of the screen
  kfFx.register("tracking-close-in", (el, { options, reduce, scroller }) => {
    if (!window.gsap || reduce || !el.textContent.trim()) return;
    const vars = { letterSpacing: options.from || "50px", opacity: +(options.fade ?? 0), duration: +(options.dur ?? 0.5), ease: kfFx.ease(options.ease || "power1.out", "power1.out"), delay: +(options.delay ?? 0) };
    if (window.ScrollTrigger && options.on !== "load") {
      gsap.registerPlugin(ScrollTrigger);
      vars.scrollTrigger = { trigger: el, start: options.start || "center 75%", end: "bottom center", scroller: scroller || undefined };
    }
    const tw = gsap.from(el, vars);
    return () => {
      tw.scrollTrigger?.kill();
      tw.kill();
      gsap.set(el, { clearProps: "letterSpacing,opacity" });
    };
  });
})();
