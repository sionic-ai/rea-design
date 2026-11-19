(() => {
  kfFx.register("beat-dots", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const beat = 60 / (+options.bpm || 142), bars = +options.bars || 4;
      const rel = kfFx.ease("0.1,0.6,0.3,0.9", "power2.out"), out = kfFx.ease("0.16,1,0.3,1", "expo.out");
      const dots = [...el.querySelectorAll("[data-fx-part=dot]")], count = el.querySelector("[data-fx-part=count]"), prog = el.querySelector("[data-fx-part=progress]"), texts = [...el.querySelectorAll("[data-fx-part=word]")];
      const words = texts.map((t) => t.dataset.barText.split("|"));
      let lit = -1, bar = -1;
      const setBar = (b) => {
        bar = b;
        if (count) count.textContent = `Bar ${b + 1} / ${bars}`;
        texts.forEach((t, i) => (t.textContent = words[i][b % words[i].length]));
        if (prog) gsap.to(prog, { scaleX: (b + 1) / bars, duration: reduce ? 0 : beat * 0.5, ease: out, overwrite: true });
        if (!reduce && texts.length) gsap.fromTo(texts, { yPercent: 30, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: beat * 0.5, ease: out, overwrite: true });
      };
      setBar(0);
      ScrollTrigger.create({ scroller, trigger: el, start: options.start || "top 80%", end: options.end || "bottom 20%", onUpdate: (s) => {
        const r = Math.min(s.progress * bars * 4, bars * 4 - 0.001), b = Math.floor(r / 4), d = Math.floor(r % 4);
        if (b !== bar) setBar(b);
        if (d === lit) return;
        lit = d;
        dots.forEach((x, k) => x.classList.toggle("is-on", k === d));
        if (!reduce && dots[d]) gsap.fromTo(dots[d], { scale: 1.18 }, { scale: 1, duration: beat * 0.5, ease: rel, overwrite: true });
      } });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
