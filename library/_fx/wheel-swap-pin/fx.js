(() => {
  // Inside a board fixed to the screen, items rotate like a wheel hung on a far axis below the screen — the next item waits tilted 40° and turns back to 0° as it comes in while that slot is lowered,
  // The previous item disappears while rotating -8°. The original applied a short .1s tween per cell using ScrollTrigger progress so it felt attached to the hand.
  kfFx.register("wheel-swap-pin", (el, { options, reduce, scroller }) => {
    const stage = el.querySelector('[data-fx-part="stage"]');
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    const steps = [...el.querySelectorAll('[data-fx-part="step"]')];
    if (!stage || items.length < 2 || steps.length < items.length - 1) return;
    const bgs = [...el.querySelectorAll('[data-fx-part="bg"]')];
    // The board title is called backdrop — named separately so it doesn’t mix with the title child of the letter-splitting part
    const title = el.querySelector('[data-fx-part="backdrop"]');
    const tilt = +(options.tilt ?? 40), out = +(options.out ?? -8), lag = +(options.lag ?? 0.1), reach = +(options.reach ?? 1.86);
    // If a single item is taller than the panel (screen), don’t rotate, stack in order. Original checkMagazinesHeight (when cover + intro exceed the screen on phone)
    const tooTall = () => items.some((it) => it.scrollHeight > (stage.clientHeight || innerHeight) + 1);
    if (reduce || (options.fit !== "none" && tooTall())) { el.classList.add("fx-wsp-static"); return () => el.classList.remove("fx-wsp-static"); }
    // Axis height — based on panel height (reach × screen width + screen height) / screen height. The wider the screen, the farther the axis, so it turns more gently
    const origin = () => {
      const h = stage.clientHeight || innerHeight;
      const y = Math.floor(((reach * innerWidth + h) / h) * 1e4) / 100;
      items.forEach((it, i) => gsap.set(it, { transformOrigin: `50% ${y}%`, rotation: i ? tilt : 0, opacity: 1 }));
    };
    origin();
    const sts = [];
    const swap = (i, p) => {
      if (bgs[i]) gsap.set(bgs[i], { opacity: 1 - p });
      gsap.to(items[i], { opacity: 1 - p, rotation: out * p, duration: lag, overwrite: true });
      gsap.to(items[i + 1], { rotation: tilt - tilt * p, duration: lag, overwrite: true });
    };
    for (let i = 0; i < items.length - 1; i++)
      sts.push(ScrollTrigger.create({ trigger: steps[i], scroller, start: "top top", end: "bottom top", scrub: true, onUpdate: (s) => swap(i, s.progress) }));
    // The board title turns on in .3s when entering the first cell, and turns off after passing the last cell
    if (title) {
      sts.push(ScrollTrigger.create({ trigger: steps[0], scroller, start: "top top", onEnter: () => gsap.to(title, { opacity: 1, duration: 0.3 }), onLeaveBack: () => gsap.to(title, { opacity: 0, duration: 0.3 }) }));
      const last = steps[steps.length - 1];
      sts.push(ScrollTrigger.create({ trigger: last, scroller, start: "top top", end: "bottom top", onLeave: () => gsap.to(title, { opacity: 0, duration: 0.3 }), onEnterBack: () => gsap.to(title, { opacity: 1, duration: 0.3 }) }));
    }
    const ro = new ResizeObserver(() => { origin(); sts.forEach((s) => s.refresh?.()); });
    ro.observe(stage);
    return () => {
      ro.disconnect();
      sts.forEach((s) => s.kill());
      gsap.killTweensOf([...items, ...bgs, title].filter(Boolean));
      gsap.set([...items, ...bgs, title].filter(Boolean), { clearProps: "transform,opacity" });
    };
  });
})();
