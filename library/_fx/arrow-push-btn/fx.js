(() => {
  // The arrow slot hidden outside the button’s left slides in by 1.2x the slot width on hover, and the text shifts by 2/3 of the slot width while rolling up one line so the second copy stands.
  // Even after release the text always rolls upward — the second set that stood exits up and the first set rises from below (original fromTo as is, so releasing midway makes it jump and reconnect).
  kfFx.register("arrow-push-btn", (el, { options, reduce, hover }) => {
    const inner = el.querySelector("[data-fx-part=inner]"), front = el.querySelector("[data-fx-part=front]");
    const label = el.querySelector("[data-fx-part=label]"), text = el.querySelector("[data-fx-part=text]"), next = el.querySelector("[data-fx-part=next]");
    if (!inner || reduce || !hover) return;
    const push = +(options.push ?? 1.2), shift = +(options.shift ?? 0.6667);
    const inDur = +(options.in ?? 0.5), outDur = +(options.out ?? 0.3), roll = +(options.roll ?? 0.6), back = +(options["roll-out"] ?? 0.5);
    const ease = kfFx.ease(options.ease || "expo.out", "expo.out");
    const rolls = [text, next].filter(Boolean);
    const w = () => (front ? front.clientWidth : 0);
    const enter = () => {
      gsap.killTweensOf([inner, label, ...rolls]);
      const a = w();
      gsap.fromTo(inner, { x: 0 }, { x: push * a, duration: inDur, ease });
      if (label) gsap.fromTo(label, { x: 0 }, { x: a * shift, duration: inDur, ease });
      rolls.forEach((r) => gsap.fromTo(r, { yPercent: 0 }, { yPercent: -100, duration: roll }));
    };
    const leave = () => {
      gsap.killTweensOf([inner, label, ...rolls]);
      const a = w();
      gsap.fromTo(inner, { x: push * a }, { x: 0, duration: outDur });
      if (label) gsap.fromTo(label, { x: a * shift }, { x: 0, duration: back });
      if (next) gsap.fromTo(next, { yPercent: -100 }, { yPercent: -200, duration: back });
      if (text) gsap.fromTo(text, { yPercent: 100 }, { yPercent: 0, duration: back });
    };
    const ac = new AbortController();
    el.addEventListener("mouseenter", enter, { signal: ac.signal });
    el.addEventListener("mouseleave", leave, { signal: ac.signal });
    return () => { ac.abort(); gsap.killTweensOf([inner, label, ...rolls]); gsap.set([inner, label, ...rolls].filter(Boolean), { clearProps: "transform" }); };
  });
})();
