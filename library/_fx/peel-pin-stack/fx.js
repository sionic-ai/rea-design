// Pins the stacked photo panels whole, and each screen peels the top panel upward from its bottom edge — the panel below rises 15% from underneath as a dark veil lifts, with a snap per panel.
// On narrow screens, in the stuck panel the photo cell is pushed up and out while the text cell drops out below
(() => {
  kfFx.register("peel-pin-stack", (el, { options, reduce, scroller }) => {
    if (!window.gsap || !window.ScrollTrigger || reduce) return;
    const view = el.querySelector('[data-fx-part="view"]');
    const items = view ? [...view.querySelectorAll(':scope > [data-fx-part="item"]')].reverse() : [];
    if (items.length < 2) return;
    const narrow = +options.narrow || 768;
    const shift = +(options.shift ?? 15);
    const snapDur = +(options.snap ?? 0.8);
    const ease = options.ease || "power1.out";
    const part = (n, name) => n.querySelector(`[data-fx-part="${name}"]`);
    const step = (extra) => gsap.timeline({
      ease: "none",
      scrollTrigger: { trigger: el, scroller, start: "top top", scrub: true, invalidateOnRefresh: true, ...(snapDur > 0 ? { snap: { snapTo: 1 / (items.length - 1), duration: snapDur, ease } } : {}), ...extra },
    });
    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${narrow}px)`, () => {
      const tl = step({ end: `+=${(items.length - 1) * 100}%`, pin: true, pinType: "transform" });
      items.slice(0, -1).forEach((item, i) => {
        const next = items[i + 1];
        tl.to(item, { clipPath: "inset(0 0 100% 0)" });
        const img = part(item, "img");
        if (img) tl.to(img, { yPercent: -shift }, "<");
        tl.from(next, { yPercent: shift }, "<");
        const layer = part(next, "layer");
        if (layer) tl.fromTo(layer, { autoAlpha: 0.9 }, { autoAlpha: 0 }, "<");
        const cap = part(next, "caption");
        if (cap) tl.from(cap, { yPercent: -100 }, "<");
      });
    });
    mm.add(`(max-width: ${narrow - 1}px)`, () => {
      const tl = step({ end: "bottom bottom", scrub: 0.3 });
      items.slice(0, -1).forEach((item, i) => {
        const next = items[i + 1];
        const media = part(item, "media");
        if (!media) return;
        tl.to(media, { yPercent: -100 });
        const inner = part(item, "inner");
        if (inner) tl.to(inner, { yPercent: 100 }, "<");
        const img = part(item, "img");
        if (img) tl.to(img, { yPercent: -shift }, "<");
        const nextImg = part(next, "img");
        if (nextImg) tl.from(nextImg, { yPercent: shift }, "<");
        const cap = part(item, "caption");
        if (cap) tl.to(cap, { yPercent: 100 }, "<");
      });
    });
    return () => mm.revert();
  });
})();
