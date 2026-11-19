(() => {
  // A screen-covering curtain (element) crosses from off left to off right (−100% → 133.3%) in steps tied to scroll while the panel is pinned,
  // The character pulling the curtain end (puller) swings ±swing° per cell. Past the cell where the curtain fully covers the screen (at), the section given in hide is hidden,
  // The scene changes behind the curtain — a kabuki curtain that returns from the page end to the fixed hero (Brand)
  kfFx.register("step-curtain-wipe", (el, { options, reduce, scroller }) => {
    const pinEl = (options.trigger && document.querySelector(options.trigger)) || el.parentElement;
    // If there’s no separate plate holding the curtain (attached directly to the document body), there’s nowhere to pin it, so don’t attach
    if (!pinEl || pinEl === document.body || pinEl === document.documentElement) return;
    gsap.registerPlugin(ScrollTrigger);
    const steps = +options.steps || 21;
    const to = +(options.to ?? 133.333333333);
    // The step where the mask sits at 0% — −100 + step × (to+100)/steps = 0
    const at = +(options.at ?? Math.round((100 * steps) / (to + 100)));
    const screens = +(options.screens ?? 2);
    const swing = +(options.swing ?? 10);
    const swings = +options.swings || steps;
    const scrub = options.scrub == null || options.scrub === "true" ? true : +options.scrub;
    const hide = options.hide ? document.querySelector(options.hide) : null;
    const puller = el.querySelector('[data-fx-part="puller"]');
    if (reduce) return;

    const pin = ScrollTrigger.create({
      trigger: pinEl, ...(scroller && { scroller }),
      start: options.start || "bottom bottom", end: () => "+=" + innerHeight * screens,
      pin: pinEl, anticipatePin: 0.3, invalidateOnRefresh: true, refreshPriority: +(options.priority ?? 0),
    });
    const range = { trigger: pinEl, ...(scroller && { scroller }), start: () => pin.start, end: () => pin.start + innerHeight * screens, scrub, invalidateOnRefresh: true };
    let last = -1;
    // GSAP reads the css translate(-100%) as px, so x is left at 0 to avoid overlap and it is pushed only with xPercent
    const wipe = gsap.fromTo(el, { x: 0, xPercent: -100 }, {
      xPercent: to, ease: `steps(${steps})`,
      scrollTrigger: {
        ...range,
        onUpdate: (self) => {
          const step = Math.floor(self.progress * steps);
          if (step === last) return;
          if (hide && last < at && step >= at && self.direction === 1) hide.style.opacity = "0";
          if (hide && last >= at && step < at && self.direction === -1) hide.style.opacity = "1";
          last = step;
          el.dispatchEvent(new CustomEvent("fx:step", { detail: { step, covered: step === at } }));
        },
      },
    });
    const sway = puller && gsap.to(puller, {
      keyframes: Array.from({ length: swings }, (_, i) => ({ rotate: i % 2 ? -swing : swing })),
      ease: `steps(${swings})`, scrollTrigger: { ...range },
    });
    return () => {
      pin.kill(true);
      wipe.scrollTrigger?.kill(); wipe.kill();
      if (sway) { sway.scrollTrigger?.kill(); sway.kill(); gsap.set(puller, { clearProps: "rotate,transform" }); }
      gsap.set(el, { clearProps: "transform" });
      if (hide) hide.style.opacity = "";
    };
  });
})();
