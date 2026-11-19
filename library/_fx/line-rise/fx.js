// If the curve is given like ”0.16,1,0.3,1”, build it with CustomEase — so each site can use the same entrance with a different curve
(() => {
  kfFx.register("line-rise", (el, { options, reduce, scroller }) => {
    const block = options.split === "none";
    if (reduce || !(block ? el.children.length : el.textContent.trim())) return;
    const ease = kfFx.ease(options.ease || "power2.inOut", "expo.out");
    if (block) el.classList.add("fx-rise-block");
    const fx = gsap.context(() => {});
    let live = true;
    document.fonts.ready.then(() => live && fx.add(() => {
      const by = options.split === "words" ? "words" : options.split === "chars" ? "chars" : "lines";
      // chars — each letter rises inside a line mask (Brand hero wordmark)
      const sp = block ? null : SplitText.create(el, { type: by === "words" ? "lines,words" : by === "chars" ? "lines,chars" : "lines", linesClass: "fx-ln", wordsClass: "fx-wd", ...(options.mask === "none" ? {} : { mask: by === "chars" ? "lines" : by }) });
      const targets = block ? el.children : sp[by];
      const quiet = (block || options.y) && options.fade !== "true";
      const rot = +(options.rotate ?? 0);
      const blur = +(options.blur ?? 0);
      // tilt — the front of the line leans down (rotateX, perspective) and rises to stand upright (Brand title −45° · 600)
      const tilt = +(options.tilt ?? 0), persp = +(options.perspective ?? 600);
      // widen — the line rises while shrinking from a width that many times wider (Studio page title 1.12). The axis is the start side of the text
      const wide = +(options.widen ?? 1), side = getComputedStyle(el).direction === "rtl" ? "100% 50%" : "0% 50%";
      // squash — the line rises already flattened by that multiple and straightens out, jitter — each line unwinds from a random tilt between ± angles (Brand .85 · 2°, axis at top left)
      const squash = options.squash != null ? +options.squash : 1, jit = +(options.jitter ?? 0);
      const bend = squash !== 1 || jit ? { ...(squash !== 1 ? { scaleY: squash } : {}), ...(jit ? { rotate: () => gsap.utils.random(-jit, jit) } : {}), transformOrigin: options.origin || "top left" } : {};
      // skew — rises tilted at that angle (skewY) then stands straight (Brand word 150% · 10°)
      const skew = +(options.skew ?? 0);
      if (skew) { bend.skewY = skew; if (!bend.transformOrigin && options.origin) bend.transformOrigin = options.origin; }
      gsap.fromTo(targets, { yPercent: options.y ? +options.y : block ? 105 : 70, autoAlpha: quiet ? 1 : 0, ...(rot ? { rotate: rot, transformOrigin: options.origin || "top left" } : {}), ...(blur ? { filter: `blur(${blur}px)` } : {}), ...(tilt ? { rotateX: tilt, transformPerspective: persp } : {}), ...(wide !== 1 ? { scaleX: wide, transformOrigin: side } : {}), ...bend }, { yPercent: 0, ...(tilt ? { rotateX: 0 } : {}), ...(wide !== 1 ? { scaleX: 1 } : {}), ...(squash !== 1 ? { scaleY: 1 } : {}), ...(skew ? { skewY: 0 } : {}), autoAlpha: 1, ...(rot || jit ? { rotate: 0 } : {}), ...(blur ? { filter: "blur(0px)" } : {}), stagger: options.stagger ? +options.stagger : 0.1, duration: (options.dur ? +options.dur : 0.5) * (options.fit ? Math.pow(parseFloat(getComputedStyle(el).fontSize) / +options.fit, 0.2) : 1), ease, delay: +(options.delay || 0),
        scrollTrigger: { scroller, trigger: el, start: options.start || "top bottom-=100", ...(options.toggle === "true" ? { toggleActions: "play none none reverse" } : { once: true }) } });
    }));
    return () => { live = false; fx.revert(); el.classList.remove("fx-rise-block"); };
  });
})();
