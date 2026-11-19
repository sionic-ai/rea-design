(() => {
  kfFx.register("strike-replace", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);
      const beat = 60 / (+options.bpm || 142);
      const io = kfFx.ease("0.65,0,0.15,1", "power3.inOut"), out = kfFx.ease("0.16,1,0.3,1", "expo.out"), snap = kfFx.ease("0.55,0,0.1,1", "power3.inOut");
      const old = el.querySelector("[data-fx-part=old]"), neu = el.querySelector("[data-fx-part=new]"), chip = el.querySelector("[data-fx-part=chip]");
      if (!old || !neu) return;
      if (reduce) { gsap.set(old, { "--fx-strike": 1, opacity: 0.45 }); gsap.set(neu, { "--fx-under": 1 }); if (chip?.dataset.to) chip.textContent = chip.dataset.to; return; }
      const chars = SplitText.create(neu, { type: "chars", mask: "chars" }).chars;
      gsap.set(chars, { yPercent: 100 });
      const tl = gsap.timeline({ paused: true })
        .to(old, { "--fx-strike": 1, opacity: 0.45, duration: beat, ease: io }, beat)
        .to(chars, { yPercent: 0, duration: beat, ease: out, stagger: beat / 4 }, beat * 2)
        .to(neu, { "--fx-under": 1, duration: beat, ease: io }, beat * 2);
      if (chip?.dataset.to) tl.to(chip, { scrambleText: { text: chip.dataset.to, chars: "0123456789" }, duration: beat, ease: snap }, beat);
      ScrollTrigger.create({ scroller, trigger: el, start: options.start || "top 70%", end: options.end || "top 25%", scrub: true, animation: tl });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
