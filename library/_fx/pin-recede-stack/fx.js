// Pin a stack of screen-height panels, while the front panel shrinks and recedes, the next panel rises from below by one screen height and covers it.
// Pinned by the pile height (the consuming side’s CSS, panel count × 100vh is the original) minus the screen height, with no offset gap — the pile height is the scroll length.
(() => {
  kfFx.register("pin-recede-stack", (el, { options, reduce, scroller }) => {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const items = [...el.querySelectorAll(':scope > [data-fx-part="item"]')];
    if (items.length < 2 || reduce) return;
    const scale = +(options.scale ?? 0.8), hold = +(options.hold ?? 2), move = +(options.move ?? 5);
    const wide = options.wide || "(min-width: 1024px)";
    const mm = gsap.matchMedia();
    mm.add({ wide, narrow: `not all and ${wide}` }, (ctx) => {
      // On narrow screens the receding board’s text (caption) is also turned off. The original sets 1 on PC and 0 on phones.
      const fade = ctx.conditions.narrow ? +(options["caption-narrow"] ?? 0) : +(options.caption ?? 1);
      const tl = gsap.timeline({
        defaults: { duration: move, ease: options.ease || "none" },
        scrollTrigger: {
          trigger: el, start: options.start || "top top", end: options.end || "bottom bottom", pin: true, pinSpacing: false,
          scrub: options.scrub === "true" ? true : +(options.scrub ?? 1.1), invalidateOnRefresh: true, ...(scroller && { scroller }),
        },
      });
      tl.to(items[0], {});
      items.forEach((item, i) => {
        if (i === items.length - 1) { tl.to(item, { duration: move }, `+=${hold}`); return; }
        tl.to(item, { scale }, `+=${hold}`);
        const cap = item.querySelector('[data-fx-part="caption"]');
        if (cap) tl.to(cap, { opacity: fade }, "<");
        tl.to(items[i + 1], { y: () => -innerHeight }, "<");
      });
      return () => gsap.set(items, { clearProps: "transform" });
    });
    return () => mm.revert();
  });
})();
