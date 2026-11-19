(() => {
  kfFx.register("fold-on-scroll", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const beat = 60 / (+options.bpm || 142), io = kfFx.ease("0.65,0,0.15,1", "power3.inOut"), at = options.at ? +options.at : 0.12;
      const kids = el.children;
      if (!kids.length) return;
      if (reduce) return ScrollTrigger.create({ scroller, start: 0, end: "max", onUpdate: (s) => gsap.set(kids, { autoAlpha: s.scroll() > (scroller ? scroller.clientHeight : innerHeight) * at ? 0 : 1 }) });
      const fold = gsap.timeline({ paused: true }).to(kids, { yPercent: 45, autoAlpha: 0, duration: beat, ease: io, stagger: beat / 8 });
      ScrollTrigger.create({ scroller, start: 0, end: () => (scroller ? scroller.clientHeight : innerHeight) * at, onLeave: () => fold.play(), onEnterBack: () => fold.reverse(), onRefresh: (s) => fold.progress(s.progress >= 1 ? 1 : 0) });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
