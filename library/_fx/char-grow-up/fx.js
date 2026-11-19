(() => {
  kfFx.register("char-grow-up", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const whole = options.split === "none";
    const fxCtx = gsap.context(() => {
      if (reduce || (!whole && !el.textContent.trim())) return;
      gsap.registerPlugin(ScrollTrigger);
      const beat = 60 / (+options.bpm || 142), out = kfFx.ease(options.ease || "0.16,1,0.3,1", "expo.out");
      // split: if none, text is not split and the element itself (color block · bar) rises
      const targets = whole ? el : (gsap.registerPlugin(SplitText), SplitText.create(el, { type: "chars" }).chars);
      // origin: top grows from top to bottom, order: random shuffles the letter order
      gsap.from(targets, { scaleY: +(options.from ?? 0.05), transformOrigin: options.origin === "top" ? "50% 0%" : "50% 100%", duration: +(options.dur ?? beat), ease: out, stagger: { each: +(options.each ?? beat / 4), from: options.order === "random" ? "random" : "start" }, scrollTrigger: { scroller, trigger: el, start: options.start || "top 85%", toggleActions: "play none none none" } });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
