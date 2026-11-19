// Several arch windows (semicircle top) open late (delay) from .8x and transparent, and the photo strip inside settles from 1.2x to its size (staggered per window).
// Once fully open, each cell moves to the next photo every every seconds (each cell staggered by lag seconds) — the old photo turns off during the fade, and the new photo turns on after fade − overlap, and
// A lit photo goes 1 → zoom times, approaching in a straight line over zoom-dur. Defaults are the original VisualSlide values.
(() => {
  kfFx.register("arch-cycle-slides", (el, { options, reduce }) => {
    const frames = [...el.querySelectorAll('[data-fx-part="frame"]')];
    if (!frames.length) return;
    const ease = kfFx.ease(options.ease || "0.19,1,0.22,1", "expo.out");
    const delay = +(options.delay ?? 1.6), dur = +(options.dur ?? 1), each = +(options.each ?? 0.15);
    const every = +options.every || 6, lag = +(options.lag ?? 0.2), fade = +(options.fade ?? 1), overlap = +(options.overlap ?? 0.8);
    const zoom = +(options.zoom ?? 1.1), zoomDur = +(options["zoom-dur"] ?? 6);
    const lists = frames.map((f) => f.querySelector('[data-fx-part="list"]') || f);
    const items = frames.map((f) => [...f.querySelectorAll('[data-fx-part="item"]')]);
    items.forEach((its) => its.length && gsap.set(its, { opacity: (i) => +(i === 0), scale: 1 }));
    if (reduce) return () => gsap.set([...frames, ...lists, ...items.flat()], { clearProps: "all" });
    const tweens = [], timers = [];
    // intro: open — cell .8x and transparent → 1, photo row 1.2x and transparent → 1 (original desktop). clip — clip-path inset(100% 0 0 0) → 0 peeling from the bottom (original 1024px and below)
    const clip = options.intro === "clip";
    if (options.intro !== "none") {
      if (clip) gsap.set(lists, { scale: 1.2, clipPath: "inset(100% 0% 0% 0%)" });
      else { gsap.set(frames, { scale: 0.8, opacity: 0 }); gsap.set(lists, { scale: 1.2, opacity: 0 }); }
      const tl = gsap.timeline({ delay });
      if (!clip) tl.to(frames, { scale: 1, opacity: 1, duration: dur, stagger: each, ease }, 0);
      tl.to(lists, { scale: 1, ...(clip ? { clipPath: "inset(0% 0% 0% 0%)" } : { opacity: 1 }), duration: dur, stagger: each, ease: clip ? kfFx.ease(options["clip-ease"] || "0.87,0,0.13,1", "expo.inOut") : ease }, 0);
      tweens.push(tl);
    }
    const start = () => {
      el.dispatchEvent(new CustomEvent("fx:open"));
      items.forEach((its, n) => {
        if (!its.length) return;
        let at = 0;
        tweens.push(gsap.to(its[0], { scale: zoom, duration: zoomDur, ease: "none" }));
        if (its.length < 2) return;
        const next = () => {
          const from = its[at], to = its[(at + 1) % its.length];
          gsap.killTweensOf([from, to]);
          gsap.set(to, { scale: 1 });
          const tl = gsap.timeline();
          tl.to(from, { opacity: 0, duration: fade, ease }).to(to, { opacity: 1, duration: fade, ease }, fade - overlap).to(to, { scale: zoom, duration: zoomDur, ease: "none" }, fade - overlap);
          tweens.push(tl);
          at = (at + 1) % its.length;
        };
        timers.push(gsap.delayedCall(every + lag * n, function loop() { next(); timers.push(gsap.delayedCall(every, loop)); }));
      });
    };
    timers.push(gsap.delayedCall(options.intro === "none" ? 0 : delay, start));
    return () => {
      timers.forEach((t) => t.kill());
      tweens.forEach((t) => t.kill());
      gsap.set([...frames, ...lists, ...items.flat()], { clearProps: "all" });
    };
  });
})();
