// Work list: middle column of 3 (n % 3 === 1) moves down 120px only during scroll to create staggered heights (desktop only)
EF.page("list", {
  scroll: (box, k) => k.mm.add({ d: "(min-width: 992px)", r: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    if (!ctx.conditions.d || ctx.conditions.r) return;
    const grid = box.querySelector("[data-work-grid]");
    const mid = [...grid.children].filter((_, i) => i % 3 === 1);
    gsap.to(mid, { y: 120, ease: "none", scrollTrigger: { trigger: grid, start: "clamp(top bottom)", end: "clamp(bottom top)", scrub: true, invalidateOnRefresh: true } });
  }),
});
