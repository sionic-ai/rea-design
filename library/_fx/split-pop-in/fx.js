(() => {
  // Line size and letter sliding sit on one timeline — letters must move only inside the line to follow the growing line
  kfFx.register("split-pop-in", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      if (reduce || !el.textContent.trim()) return;
      gsap.registerPlugin(ScrollTrigger, SplitText);
      // Defaults are the original values. Where a person is waiting, like the loader or Hero, shorten them — time to finish standing is delay + max(dur, in + each × (letter count − 1))
      const dur = +(options.dur ?? 1), dIn = +(options.in ?? 0.7), each = +(options.each ?? 0.03);
      const smooth = kfFx.ease("0.65,0,0.35,1", "power2.inOut"), slow = kfFx.ease("0.16,1,0.3,1", "expo.out");
      const split = SplitText.create(el, { type: "chars", charsClass: "fx-ch" });
      const tl = gsap.timeline({ paused: true, delay: +(options.delay ?? 0) })
        .from(el, { scale: 0.1, duration: dur, ease: smooth })
        .from(split.chars, { y: (i) => (i % 2 === 0 ? "-100%" : "100%"), duration: dIn, ease: slow, stagger: { each, from: "random" } }, "<");
      if (options.on === "enter") ScrollTrigger.create({ scroller, trigger: el, start: "top bottom-=100", once: true, onEnter: () => tl.play() });
      else tl.play();
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
