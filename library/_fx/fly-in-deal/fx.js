(() => {
  kfFx.register("fly-in-deal", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const reveal = kfFx.ease("0.23,1,0.32,1", "expo.out"), fade = kfFx.ease("0.4,0,0.2,1", "power1.inOut");
      const [fx, fy, fr, fs] = (options.from || "520,160,13,1").split(",").map(Number);
      const shift = options.shift === "none" ? null : (options.shift || "-14,-16,-2.6").split(",").map(Number);
      const dur = options.dur ? +options.dur : 0.75, gap = options.gap ? +options.gap : 0.25, TILT = [-3, -2, -4, -2.5, -3.5, -2];
      const cards = [...el.children];
      if (!cards.length) return;
      const tilt = (c, i) => (c.dataset.tilt !== undefined ? +c.dataset.tilt : TILT[i % TILT.length]);
      if (reduce) return cards.forEach((c, i) => gsap.set(c, { rotation: tilt(c, i), x: shift ? (cards.length - 1 - i) * shift[0] : 0, y: shift ? (cards.length - 1 - i) * shift[1] : 0 }));
      gsap.set(cards, { autoAlpha: 0 });
      const tl = gsap.timeline({ paused: options.play !== "enter" });
      cards.forEach((c, i) => {
        const at = i * (shift ? 0.5 + gap : gap), r = tilt(c, i);
        if (i > 0 && shift) tl.to(cards.slice(0, i), { x: `+=${shift[0]}`, y: `+=${shift[1]}`, rotation: `+=${shift[2]}`, duration: 0.5, ease: fade }, at);
        tl.fromTo(c, { x: fx, y: fy, rotation: r + fr, scale: fs }, { x: 0, y: 0, rotation: r, scale: 1, duration: dur, ease: reveal }, at)
          .to(c, { autoAlpha: 1, duration: Math.min(0.5, dur / 2), ease: fade }, at);
      });
      if (options.play === "enter") { tl.pause(); ScrollTrigger.create({ scroller, trigger: el, start: "top 80%", once: true, onEnter: () => tl.play() }); }
      else ScrollTrigger.create({ scroller, trigger: el, start: "top 80%", end: "bottom 20%", scrub: 0.5, animation: tl });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
