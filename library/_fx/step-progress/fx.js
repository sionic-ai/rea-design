(() => {
  kfFx.register("step-progress", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const beat = 60 / (+options.bpm || 142), io = kfFx.ease("0.65,0,0.15,1", "power3.inOut"), rel = kfFx.ease("0.1,0.6,0.3,0.9", "power2.out");
      const steps = [...el.querySelectorAll("li")], conns = [...el.querySelectorAll("[data-fx-part=link]")], boxes = steps.map((s) => s.querySelector("[data-fx-part=box]") || s);
      if (!steps.length) return;
      const at = (k) => steps.forEach((s, j) => (s.dataset.state = j < k ? "done" : j === k ? "current" : "ahead"));
      if (reduce) { at(0); return; }
      const tl = gsap.timeline({ paused: true, repeat: -1 });
      tl.call(at, [0], 0);
      if (conns.length) tl.set(conns, { scaleX: 0 }, 0);
      for (let r = 1; r < steps.length; r++) {
        const t = r * beat * 2;
        if (conns[r - 1]) tl.to(conns[r - 1], { scaleX: 1, duration: beat, ease: io }, t - beat);
        tl.call(at, [r], t).fromTo(boxes[r], { scale: 1.15 }, { scale: 1, duration: beat * 0.5, ease: rel, immediateRender: false }, t);
      }
      tl.set({}, {}, steps.length * beat * 2);
      ScrollTrigger.create({ scroller, trigger: el, start: "top bottom", end: "bottom top", onToggle: (s) => (s.isActive ? tl.play() : tl.pause()) });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
