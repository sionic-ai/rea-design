// A pinned giant title is covered by later sections and shows through only in gaps where the background is cleared, and is pushed up while the gap passes the screen
(() => {
  kfFx.register("gap-peek-title", (el, { options, reduce, scroller }) => {
    const title = el.querySelector('[data-fx-part="title"]');
    const gaps = [...el.querySelectorAll('[data-fx-part="gap"]')];
    if (!title || !gaps.length) return;
    const m = String(options.shift ?? "-10rem").trim().match(/^(-?[\d.]+)([a-z%]*)$/);
    const v = m ? +m[1] : -10, unit = m ? m[2] || "px" : "rem";
    const ease = kfFx.ease(options.ease || "power1.out", "power1.out");
    const mm = gsap.matchMedia();
    mm.add(`${options.media || "(min-width: 768px)"} and (prefers-reduced-motion: no-preference)`, () => {
      if (reduce) return;
      // With multiple gaps, push once more per gap — continuing from where the previous gap pushed
      gaps.forEach((gap, i) => gsap.fromTo(title, { "--fx-peek-y": `${v * i}${unit}` }, {
        "--fx-peek-y": `${v * (i + 1)}${unit}`, ease, immediateRender: i === 0,
        scrollTrigger: { trigger: gap, scroller, start: options.start || "top bottom", end: options.end || "bottom top", scrub: options.scrub ? +options.scrub : true },
      }));
    });
    return () => { mm.revert(); title.style.removeProperty("--fx-peek-y"); };
  });
})();
