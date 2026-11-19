// With the section pinned, while scrolling photo count × per%, only the photo in the slot given by the progress share divided by the photo count is turned on (floor(progress × count)).
// The changing shape is an opacity transition in fx.css — not tied to scroll, it cross-fades over .8s at the moment the cell changes
(() => {
  kfFx.register("pin-step-fade", (el, { options, reduce, scroller }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const show = (i) => items.forEach((it, k) => it.classList.toggle("is-active", k === i));
    // Progress bar (optional child) — each slot divided by bar count fills to its share of height (the two left bars of the Brand features section)
    const bars = [...el.querySelectorAll('[data-fx-part="bar"]')];
    const fill = (p) => bars.forEach((b, i) => { const a = i / bars.length, z = (i + 1) / bars.length; b.style.height = `${Math.max(0, Math.min(1, (p - a) / (z - a))) * 100}%`; });
    show(0);
    fill(0);
    if (reduce || items.length < 2) return () => { items.forEach((it) => it.classList.remove("is-active")); bars.forEach((b) => (b.style.height = "")); };
    const per = +(options.per ?? 100);
    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${+(options.from || 768)}px)`, () => {
      ScrollTrigger.create({
        trigger: el, scroller, pin: true, scrub: true, invalidateOnRefresh: true, refreshPriority: +(options.priority ?? 0),
        start: options.start || "top top",
        end: () => `+=${items.length * per}%`,
        onUpdate: (st) => { show(Math.min(items.length - 1, Math.floor(st.progress * items.length))); fill(st.progress); },
      });
    });
    return () => { mm.revert(); items.forEach((it) => it.classList.remove("is-active")); bars.forEach((b) => (b.style.height = "")); };
  });
})();
