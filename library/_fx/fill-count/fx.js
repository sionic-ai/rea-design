(() => {
  kfFx.register("fill-count", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const beat = 60 / (+options.bpm || 142), io = kfFx.ease("0.65,0,0.15,1", "power3.inOut"), out = kfFx.ease("0.16,1,0.3,1", "expo.out");
      const fill = el.querySelector("[data-fx-part=fill]"), pct = el.querySelector("[data-fx-part=count]"), after = el.querySelectorAll("[data-fx-part=after]"), t = { v: 0 };
      if (!fill && !pct) return;
      if (reduce) { if (pct) pct.textContent = "100%"; return; }
      const loop = options.loop === "true";
      const tl = gsap.timeline({ paused: true, repeat: loop ? -1 : 0, repeatDelay: beat * 5 });
      if (fill) tl.from(fill, { scaleX: 0, duration: beat * 4, ease: io }, 0);
      tl.fromTo(t, { v: 0 }, { v: 100, duration: beat * 4, ease: io, onUpdate: () => pct && (pct.textContent = `${Math.round(t.v)}%`) }, 0);
      after.forEach((a, i) => tl.from(a, i ? { x: -8, autoAlpha: 0, duration: beat, ease: out } : { y: 8, autoAlpha: 0, duration: beat, ease: out }, beat * (4 + i * 2)));
      if (loop) ScrollTrigger.create({ scroller, trigger: el, start: "top bottom", end: "bottom top", onToggle: (s) => (s.isActive ? tl.play() : tl.pause()) });
      else ScrollTrigger.create({ scroller, trigger: el, start: "top 85%", once: true, onEnter: () => tl.play() });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
