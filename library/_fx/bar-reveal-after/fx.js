(() => {
  kfFx.register("bar-reveal-after", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const beat = 60 / (+options.bpm || 142), out = kfFx.ease("0.16,1,0.3,1", "expo.out"), snap = kfFx.ease("0.55,0,0.1,1", "power3.inOut");
      const after = (options.after && document.querySelector(options.after)) || document.querySelector("main > *, section");
      if (!after) return;
      const show = (on, now) => gsap.to(el, { yPercent: on ? 0 : -100, autoAlpha: on ? 1 : 0, duration: now || reduce ? 0 : beat * 0.75, ease: on ? out : snap, overwrite: true });
      show(false, true);
      ScrollTrigger.create({ scroller, start: () => Math.max(1, after.getBoundingClientRect().top - (scroller ? scroller.getBoundingClientRect().top - scroller.scrollTop : -scrollY) + after.offsetHeight - el.offsetHeight), end: "max", invalidateOnRefresh: true,
        onToggle: (s) => show(s.isActive), onRefresh: (s) => show(s.isActive, true) });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
