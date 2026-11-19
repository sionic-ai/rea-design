(() => {
  kfFx.register("branch-grow", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);
      const reveal = kfFx.ease("0.23,1,0.32,1", "expo.out");
      const nodes = [...el.querySelectorAll("[data-fx-part=node]")], edges = [...el.querySelectorAll("[data-fx-part=edge]")];
      if (reduce) return;
      const enter = options.play === "enter";
      const [draw, apart, pop, t0] = enter ? [0.42, 0.2, 0.34, 0.28] : [0.85, 0.42, 0.4, 0.5];
      const tl = gsap.timeline({ paused: true });
      if (nodes[0]) tl.fromTo(nodes[0], { scale: 0.72, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: enter ? 0.36 : 0.5, ease: reveal }, 0);
      edges.forEach((e, i) => {
        const at = t0 + i * apart;
        tl.fromTo(e, { drawSVG: "0%" }, { drawSVG: "100%", duration: draw, ease: "power1.inOut" }, at);
        if (nodes[i + 1]) tl.fromTo(nodes[i + 1], { scale: 0.72, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: pop, ease: reveal }, at + (enter ? 0.24 : draw - 0.18));
      });
      tl.progress(0);
      if (enter) ScrollTrigger.create({ scroller, trigger: el, start: "top 90%", once: true, onEnter: () => tl.play() });
      else ScrollTrigger.create({ scroller, trigger: el, start: "top 75%", end: "center 40%", scrub: 0.5, animation: tl });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
