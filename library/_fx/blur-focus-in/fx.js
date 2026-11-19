(() => {
  // Sharpens from blur and transparency — by default once for .8s when reaching 85% of the screen, with on: load right after attach after a delay (long 2s like the hero logo·image)
  kfFx.register("blur-focus-in", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    const blur = +(options.blur ?? 10), dur = +(options.dur ?? 0.8), delay = +(options.delay ?? 0);
    const ease = !options.ease ? "power1.out" : /^[\d.,\s-]+$/.test(options.ease) ? kfFx.ease(options.ease, "power1.out") : options.ease;
    // scale — starting size (shrinks into place and sharpens, Name 1.05). 0 is meaningless, 1 keeps the size unchanged
    const scale = +(options.scale ?? 1);
    // bright — starting brightness (from washed-out bright to its own brightness, Brand video 1.4). At 1 the brightness is left untouched
    const bright = +(options.bright ?? 1), b0 = bright !== 1 ? `brightness(${bright}) ` : "", b1 = bright !== 1 ? "brightness(1) " : "";
    // y — distance initially pushed down (px, Brand photo 30). If 0, the position is left untouched
    const y = +(options.y ?? 0);
    // end — end blur (px, Brand watercolor decoration 1). At 0 it clears completely
    const end = +(options.end ?? 0);
    // fade — the duration (in seconds) for the transparency to clear. If absent it matches dur. The blur takes 1.6s while the transparency clears earlier in .8s (Brand isFadeBlurIn)
    const fade = +(options.fade ?? dur), split = fade !== dur;
    const vars = { ...(split ? {} : { opacity: 1 }), filter: `${b1}blur(${end}px)`, duration: dur, delay, ease, ...(scale !== 1 ? { scale: 1 } : {}), ...(y ? { y: 0 } : {}) };
    const trig = () => ({ trigger: el, scroller: scroller || undefined, start: options.start || "top 85%", toggleActions: "play none none none" });
    if (options.on !== "load") vars.scrollTrigger = trig();
    // from — starting opacity (frost .3: doesn’t vanish entirely, waits faintly blurred). 0 is a meaningful number so read it with ??
    const from = +(options.from ?? 0);
    const tw = gsap.fromTo(el, { ...(split ? {} : { opacity: from }), filter: `${b0}blur(${blur}px)`, ...(scale !== 1 ? { scale } : {}), ...(y ? { y } : {}) }, vars);
    const tw2 = split ? gsap.fromTo(el, { opacity: from }, { opacity: 1, duration: fade, delay, ease, ...(options.on !== "load" ? { scrollTrigger: trig() } : {}) }) : null;
    return () => {
      [tw, tw2].forEach((t) => { if (!t) return; t.scrollTrigger && t.scrollTrigger.kill(); t.kill(); });
      gsap.set(el, { clearProps: y ? "opacity,filter,scale,transform" : "opacity,filter,scale" });
    };
  });
})();
