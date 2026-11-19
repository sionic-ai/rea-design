(() => {
  const FROM = { left: "inset(0% 100% 0% 0%)", right: "inset(0% 0% 0% 100%)", top: "inset(0% 0% 100% 0%)", bottom: "inset(100% 0% 0% 0%)" };
  kfFx.register("before-after-scrub", (el, { options, reduce, scroller }) => {
    const after = el.querySelector(':scope > [data-fx-part="after"]');
    if (!after) return;
    // Name tags are often placed on a separate pillar beside the panel, so climb through ancestors to find them — stop at an ancestor that holds other before/after panels so we don’t pick up someone else’s name tag
    let lb = null, la = null;
    for (let s = el; s && s !== document.body; s = s.parentElement) {
      if (s !== el && s.querySelectorAll('[data-fx~="before-after-scrub"]').length > 1) break;
      lb = s.querySelector('[data-fx-part="label-before"]');
      la = s.querySelector('[data-fx-part="label-after"]');
      if (lb || la) break;
    }
    if (reduce) {
      gsap.set(after, { clipPath: "none" });
      if (lb) gsap.set(lb, { yPercent: -100 });
      return () => gsap.set([after, lb, la].filter(Boolean), { clearProps: "clipPath,transform" });
    }
    gsap.registerPlugin(ScrollTrigger);
    const fx = gsap.context(() => {
      if (la) gsap.set(la, { yPercent: 100 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, scroller, start: options.start || "center 65%", end: options.end || "center 45%", scrub: true } });
      tl.fromTo(after, { clipPath: FROM[options.from] || FROM.left }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "none" }, 0);
      if (lb) tl.to(lb, { yPercent: -100, duration: 0.3, ease: "none" }, 0.35);
      if (la) tl.to(la, { yPercent: 0, duration: 0.3, ease: "none" }, 0.35);
    });
    return () => fx.revert();
  });
})();
