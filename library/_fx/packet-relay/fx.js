(() => {
  kfFx.register("packet-relay", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const beat = 60 / (+options.bpm || 142), io = kfFx.ease("0.65,0,0.15,1", "power3.inOut"), out = kfFx.ease("0.16,1,0.3,1", "expo.out");
      const cards = [...el.querySelectorAll("[data-fx-part=card]")], packet = el.querySelector("[data-fx-part=packet]");
      if (cards.length < 2 || !packet) return;
      const specs = cards.map((c) => [...c.querySelectorAll("[data-fx-part=spec]")]), n = Math.max(1, ...specs.map((s) => s.length));
      specs.forEach((s) => s.forEach((x, k) => gsap.set(x, { autoAlpha: k === s.length - 1 ? 1 : 0 })));
      if (reduce) return;
      const cx = (k) => cards[k].offsetLeft + cards[k].offsetWidth / 2, cycle = beat * 8;
      const tl = gsap.timeline({ paused: true, repeat: -1 });
      for (let r = 0; r < n; r++) {
        const s0 = r * cycle;
        cards.forEach((card, c) => {
          const at = s0 + c * beat * 2, sp = specs[c];
          if (sp.length) tl.fromTo(sp[(r + sp.length - 1) % sp.length], { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -6, duration: beat * 0.5, ease: io, immediateRender: false }, at)
            .fromTo(sp[r % sp.length], { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: beat * 0.5, ease: out, immediateRender: false }, at + beat * 0.25);
          tl.fromTo(card, { "--hit": 1 }, { "--hit": 0, duration: beat * 1.5, ease: out, immediateRender: false }, at);
        });
        tl.fromTo(packet, { x: () => cx(0), autoAlpha: 0 }, { autoAlpha: 1, duration: beat * 0.5, immediateRender: false }, s0);
        for (let c = 1; c < cards.length; c++) tl.to(packet, { x: () => cx(c), duration: beat * 1.5, ease: io }, s0 + beat * 0.5 + (c - 1) * beat * 2);
        tl.to(packet, { autoAlpha: 0, duration: beat * 0.5 }, s0 + beat * 0.5 + (cards.length - 1) * beat * 2);
        tl.set({}, {}, s0 + cycle);
      }
      ScrollTrigger.create({ scroller, trigger: el, start: "top bottom", end: "bottom top", onToggle: (s) => (s.isActive ? tl.play() : tl.pause()) });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
