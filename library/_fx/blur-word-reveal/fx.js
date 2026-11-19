(() => {
  // Splits the title into words, and each word resolves in turn from blur and transparency — once when even 1px enters the screen (with on: load, right when attached)
  kfFx.register("blur-word-reveal", (el, { options, reduce, scroller }) => {
    // split: none — doesn’t split into words, the element settles in as a whole (body paragraphs and photo cells on Brand). Cells without text, like photos, are accepted too
    const whole = options.split === "none";
    if (reduce || (!whole && (!window.SplitText || !el.textContent.trim()))) return;
    const blur = +(options.blur ?? 10), dur = +(options.dur ?? 1.3), stagger = +(options.stagger ?? 0.1);
    const delay = +(options.delay ?? 0), to = +(options.opacity ?? 1);
    // rise — words rise from this % of their own height below (Brand hero title 20). 0 means they form in place
    const rise = +(options.rise ?? 0);
    // scale — settles by growing to 1 from this factor (Brand photo .95). 1 keeps the size
    const scale = +(options.scale ?? 1);
    const ease = !options.ease ? "power1.out" : kfFx.ease(options.ease, "power1.out");
    const split = whole ? null : new SplitText(el, { type: "words" });
    const targets = whole ? el : split.words;
    if (!whole) gsap.set(el, { autoAlpha: 1 });
    const from = { autoAlpha: 0, ...(blur ? { filter: `blur(${blur}px)` } : {}), ...(rise ? { yPercent: rise } : {}), ...(scale !== 1 ? { scale } : {}) };
    const vars = { autoAlpha: to, ...(blur ? { filter: "blur(0px)" } : {}), duration: dur, stagger, delay, ease, ...(rise ? { yPercent: 0 } : {}), ...(scale !== 1 ? { scale: 1 } : {}) };
    if (options.on !== "load") vars.scrollTrigger = { trigger: el, scroller: scroller || undefined, start: options.start || "top bottom", toggleActions: "play none none none" };
    const tw = gsap.fromTo(targets, from, vars);
    return () => { tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); if (split) split.revert(); gsap.set(el, { clearProps: whole ? "opacity,visibility,filter,scale,transform" : "opacity,visibility" }); };
  });
})();
