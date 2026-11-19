(() => {
  // Newspaper flying in while spinning — the page panel, small (.4) and spun two turns (720°), rises from below the screen (25vw) and stops at the top (−18vw),
  // After a short (.5s) rest, it unwinds two turns backward while expanding to its own size and settles in place. Being 720°, it looks upright while rising.
  kfFx.register("spin-in-page", (el, { options, reduce }) => {
    if (!window.gsap) return;
    const min = +(options.min ?? 992);
    if (reduce || innerWidth < min) {
      el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
      return;
    }
    const ease = kfFx.ease(options.ease || "expo.inOut", "expo.inOut");
    const scale = +(options.scale ?? 0.4);
    const turns = +(options.turns ?? 720);
    const from = +(options.from ?? 25);
    const rise = +(options.rise ?? -18);
    const riseDur = +(options.dur ?? 2);
    const pause = +(options.pause ?? 0.5);
    const spin = +(options.spin ?? 2);
    const settle = +(options.settle ?? 1.5);
    const lock = options.lock !== "0";
    const root = document.documentElement;
    const was = root.style.overflow;
    if (lock) root.style.overflow = "hidden";
    gsap.set(el, { transformOrigin: options.origin || "50% 10%", scale, rotation: turns, y: `${from}vw` });
    const tl = gsap.timeline({
      onComplete: () => {
        if (lock) root.style.overflow = was;
        gsap.set(el, { clearProps: "transform" });
        el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
      },
    });
    tl.to(el, { y: `${rise}vw`, duration: riseDur, ease });
    tl.to(el, { scale: 1, rotation: 0, duration: spin, ease }, riseDur + pause);
    tl.to(el, { y: 0, duration: settle, ease }, riseDur + pause);
    return () => {
      tl.kill();
      if (lock) root.style.overflow = was;
      gsap.set(el, { clearProps: "transform" });
    };
  });
})();
