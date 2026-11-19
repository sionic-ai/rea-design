// The path is tied to scroll and drawn from start to end (no curve), and each step lined up on the path appears at its own turn (i ÷ (n−1) − .04)
// The center picture (grow) pops out expanding from width 0 to its own width (back.out(3.5)), and .02 later the note tilts −5° and pops.
// From when the panel top touches 70% of the screen until its bottom touches 70%, it trails behind with scrub 1.2
(() => {
  kfFx.register("path-pop-scrub", (el, { options, reduce, scroller }) => {
    if (!window.ScrollTrigger) return;
    const paths = [...el.querySelectorAll('[data-fx-part="path"]')];
    const steps = [...el.querySelectorAll('[data-fx-part="step"]')];
    if (!paths.length && !steps.length) return;
    const start = options.start || "top 70%", end = options.end || "bottom 70%", scrub = +(options.scrub ?? 1.2);
    const step = +(options.step ?? 0.14), lead = +(options.lead ?? 0.04), tilt = +(options.tilt ?? -5), ease = options.ease || "back.out(3.5)";
    const mm = gsap.matchMedia();
    let built = null;
    const build = () => {
      built?.revert();
      built = gsap.context(() => {
        paths.forEach((p) => {
          const L = p.getTotalLength?.() || 3000;
          gsap.set(p, { strokeDasharray: `${L} ${L * 2}`, strokeDashoffset: L });
        });
        const parts = steps.map((s) => {
          const grow = s.querySelector('[data-fx-part="grow"]'), note = s.querySelector('[data-fx-part="note"]');
          const w = grow ? grow.getBoundingClientRect().width || grow.offsetWidth : 0;
          if (grow) gsap.set(grow, { width: 0, scale: 0, opacity: 0, overflow: "hidden", flexShrink: 0 });
          if (note) gsap.set(note, { scale: 0, rotation: 0, opacity: 0, transformOrigin: "50% 50%" });
          return { grow, note, w };
        });
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, scroller, start, end, scrub, invalidateOnRefresh: true } });
        paths.forEach((p) => tl.to(p, { strokeDashoffset: 0, ease: "none", duration: 1 }, 0));
        const n = parts.length;
        parts.forEach(({ grow, note, w }, i) => {
          const at = Math.max(0, (n > 1 ? i / (n - 1) : 0) - lead);
          if (grow) tl.to(grow, { width: w, scale: 1, opacity: 1, duration: step, ease }, at);
          if (note) tl.to(note, { scale: 1, rotation: tilt, opacity: 1, duration: step, ease }, at + 0.02);
        });
        if (tl.duration() < 1) tl.to({}, { duration: 1 - tl.duration() });
      }, el);
    };
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (reduce) return;
      build();
      // Re-measure when fonts or images load late and the stage width changes
      let last = el.offsetWidth;
      const ro = new ResizeObserver(() => { if (Math.abs(el.offsetWidth - last) > 1) { last = el.offsetWidth; build(); ScrollTrigger.refresh(); } });
      ro.observe(el);
      return () => { ro.disconnect(); built?.revert(); built = null; };
    });
    return () => mm.revert();
  });
})();
