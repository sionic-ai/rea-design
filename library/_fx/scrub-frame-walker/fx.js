(() => {
  // The character walks with progress from off the panel’s right to its left end — position follows scrub seconds late (power3),
  // Splits progress into frames cells and on each cell change alternately shows two images (footsteps). Position is moved with css right like the original (the original’s progress kid)
  kfFx.register("scrub-frame-walker", (el, { options, reduce, scroller }) => {
    const frames = [...el.querySelectorAll('[data-fx-part="frame"]')];
    if (frames.length < 2) return;
    const count = +options.frames || 24;
    const scrub = +(options.scrub ?? 0.3);
    const toRight = options.dir === "right";
    const side = toRight ? "left" : "right";
    let cur = 0;
    const show = (i) => frames.forEach((f, k) => (f.style.opacity = k === i ? "1" : "0"));
    show(0);
    if (reduce) return () => frames.forEach((f) => (f.style.opacity = ""));

    const walk = gsap.to(el, { [side]: "100%", ease: "none", paused: true });
    const frameAt = (p) => {
      const i = Math.floor(p * count);
      if (i === cur || i >= count) return;
      cur = i;
      show(i % 2 === 0 ? 1 : 0);
    };
    const settle = (p) => {
      if (p >= 1) { cur = count - 1; show((count - 1) % 2 === 0 ? 1 : 0); }
      if (p <= 0) { cur = 0; show(0); }
    };
    let follow;
    const go = (p) => {
      follow = gsap.to(walk, { progress: p, duration: scrub, ease: "power3", overwrite: true });
      frameAt(p);
      settle(p);
    };

    // drive: event — the user sends the pinned section’s progress (0~1) via fx:progress. Otherwise it measures itself by scrolling past the panel (parent).
    if (options.drive === "event") {
      const on = (e) => go(Math.max(0, Math.min(1, +e.detail?.progress || 0)));
      el.addEventListener("fx:progress", on);
      return () => { el.removeEventListener("fx:progress", on); follow?.kill(); walk.kill(); gsap.set(el, { clearProps: side }); frames.forEach((f) => (f.style.opacity = "")); };
    }
    gsap.registerPlugin(ScrollTrigger);
    const area = (options.area && el.closest(options.area)) || el.parentElement;
    const st = ScrollTrigger.create({
      trigger: area, ...(scroller && { scroller }),
      start: options.start || "top bottom", end: options.end || "bottom top",
      onUpdate: (self) => go(self.progress),
      onLeave: () => settle(1), onLeaveBack: () => settle(0),
    });
    return () => { st.kill(); follow?.kill(); walk.kill(); gsap.set(el, { clearProps: side }); frames.forEach((f) => (f.style.opacity = "")); };
  });
})();
