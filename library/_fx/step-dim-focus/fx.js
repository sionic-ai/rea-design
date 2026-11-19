(() => {
  // Title letter spacing is set by letter count (original .7s / letter count, .008~.03) — even long titles light up within the same time
  kfFx.register("step-dim-focus", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger, SplitText);
      const fade = kfFx.ease("0.4,0,0.2,1", "power1.inOut"), dim = options.dim ? +options.dim : 0.32;
      const kids = [...el.children];
      if (reduce || kids.length < 2) return;
      const tl = gsap.timeline({ paused: true });
      const head = kids[0];
      if (/^H[1-6]$/.test(head.tagName)) {
        const chars = SplitText.create(head, { type: "words,chars" }).chars, each = Math.max(0.008, Math.min(0.03, 0.7 / chars.length));
        tl.fromTo(chars, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05, ease: "none", stagger: each }, 0);
      } else tl.fromTo(head, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.55, ease: fade }, 0);
      kids.slice(1).forEach((k, i) => {
        const at = tl.duration() + 0.3;
        gsap.set(k, { autoAlpha: 0 });
        tl.to(kids[i], { opacity: dim, duration: 0.55, ease: fade }, at).to(k, { autoAlpha: 1, duration: 0.55, ease: fade }, at);
      });
      ScrollTrigger.create({ scroller, trigger: el, start: options.start || "top 75%", end: options.end || "bottom 35%", scrub: 0.5, animation: tl });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
