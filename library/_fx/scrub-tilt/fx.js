(() => {
  kfFx.register("scrub-tilt", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const v = {};
      if (options.rotate) v.rotate = +options.rotate;
      if (options.rx) v.rotateX = +options.rx;
      if (options.y) options.y.endsWith("%") ? (v.yPercent = parseFloat(options.y)) : (v.y = +options.y);
      const from = options.dir === "from";
      const trigger = (options.trigger && el.closest(options.trigger)) || (options.trigger && document.querySelector(options.trigger)) || el;
      // Axis and trailing lag differ per original — the Name letter collage uses the right-edge axis·scrub true
      if (options.origin) gsap.set(el, { transformOrigin: options.origin });
      if (options.persp) gsap.set(el, { transformPerspective: +options.persp });
      // scrub 0 is read by ScrollTrigger as ”no scrub”, so it is changed to true (sticks right away)
      const lag = options.scrub === "true" ? 0 : +(options.scrub ?? 0.5);
      const scrub = lag > 0 ? lag : true;
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap[from ? "from" : "to"](el, { ...v, ease: options.ease || (from ? "power2.out" : "none"),
          scrollTrigger: { scroller, trigger, start: options.start || (from ? "top bottom" : "top bottom-=100px"), end: options.end || "center center", scrub } });
      });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
