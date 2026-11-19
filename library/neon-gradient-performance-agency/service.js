// Service — pinned feature: the panel is pinned at screen center for feature count × 150% (phone 100%), and at every 1/n of progress the next image opens from inset(50%)→(0%) in .75s power4.inOut (phone .3s),
// Old text goes out 30px up in .4s while new text rises from 30px below at .1s intervals. On going back, the current picture folds again. The progress bar follows straight in .5s.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-sticky-feature-wrap]").forEach((wrap) => {
    const visuals = Array.from(wrap.querySelectorAll("[data-sticky-feature-visual-wrap]"));
    const items = Array.from(wrap.querySelectorAll("[data-sticky-feature-item]"));
    const bar = wrap.querySelector("[data-sticky-feature-progress]");
    const n = Math.min(visuals.length, items.length);
    if (!n) return;
    const texts = (el) => Array.from(el.querySelectorAll("[data-sticky-feature-text]"));
    gsap.set(visuals[0], { clipPath: "inset(0%)" });
    gsap.set(items[0], { autoAlpha: 1 });
    gsap.matchMedia().add({ phone: "(max-width: 767px)", any: "(min-width: 0px)" }, (ctx) => {
      const { phone } = ctx.conditions;
      const dwell = phone ? 100 : 150, dur = reduce ? 0.01 : phone ? 0.3 : 0.75;
      const setBar = bar ? gsap.quickTo(bar, "scaleX", { duration: 0.5, ease: "none" }) : null;
      let cur = 0;
      const out = (el) => gsap.timeline().to(texts(el), { autoAlpha: 0, y: -30, ease: "power4.out", duration: 0.4 }).set(el, { autoAlpha: 0 });
      const into = (el) => { gsap.set(el, { autoAlpha: 1 }); gsap.fromTo(texts(el), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, ease: "power4.out", duration: dur, stagger: 0.1 }); };
      const go = (a, b) => {
        if (a === b) return;
        const tl = gsap.timeline({ defaults: { overwrite: "auto" } });
        if (a < b) tl.to(visuals[b], { clipPath: "inset(0%)", duration: dur, ease: "power4.inOut" }, 0);
        else tl.to(visuals[a], { clipPath: "inset(50%)", duration: dur, ease: "power4.inOut" }, 0);
        out(items[a]); into(items[b]);
      };
      ScrollTrigger.create({
        trigger: wrap, start: "center center", end: () => `+=${n * dwell}%`, pin: true, scrub: true, invalidateOnRefresh: true,
        onUpdate: (self) => {
          const i = Math.max(0, Math.min(n - 1, Math.floor(self.progress * n)));
          setBar?.(self.progress);
          if (i !== cur) { const a = cur; cur = i; ctx.add(() => go(a, i)); }
        },
      });
    });
  });
})();
