// Within a long section, media (video/photo) pinned to the screen grows straight from → 1 over grow screens, starting when the section top reaches the screen top (tied to scroll).
// When full, add is-full to the section so the cover and body rise late via CSS, and remove it when going back below 1.
(() => {
  kfFx.register("sticky-grow-reveal", (el, { options, reduce, scroller }) => {
    const media = el.querySelector('[data-fx-part="media"]');
    if (!media || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const from = +(options.from ?? 0.8), grow = +(options.grow ?? 1);
    const full = (on) => el.classList.toggle("is-full", on);
    if (reduce) { gsap.set(media, { scale: 1 }); full(true); return () => { full(false); gsap.set(media, { clearProps: "transform" }); }; }
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(media, { scale: from }, {
        scale: 1, ease: "none",
        scrollTrigger: {
          trigger: el, scroller, start: options.start || "top top",
          end: () => `+=${(scroller ? scroller.clientHeight : innerHeight) * grow}`,
          scrub: options.lag ? +options.lag : true, invalidateOnRefresh: true,
          onUpdate: (st) => full(st.progress >= 1),
          onRefresh: (st) => full(st.progress >= 1),
        },
      });
    });
    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(el);
    return () => { ro.disconnect(); mm.revert(); full(false); gsap.set(media, { clearProps: "transform" }); };
  });
})();
