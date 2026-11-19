// Pin the Hero section under the header (later sections slide up over it without leaving a gap) and follow the scroll —
// While the text block slides up and vanishes, the photo cell expands to fill the screen (100vw×100vh), then after a beat shrinks to .95x and vanishes
(() => {
  kfFx.register("pin-fill-fade", (el, { options, reduce, scroller }) => {
    const photo = el.querySelector('[data-fx-part="photo"]');
    if (!photo || reduce) return;
    const fades = [...el.querySelectorAll('[data-fx-part="fade"]')];
    const head = options.header ? String(options.header) : "";
    const top = () => (head ? document.querySelector(head)?.offsetHeight || 0 : 0) + +(options.offset ?? 0);
    const len = +(options.length ?? 2000), scrub = +(options.scrub ?? 1.5), room = +(options.spacer ?? 1200);
    const rise = +(options.rise ?? -30), each = +(options.stagger ?? 0.1), hold = +(options.hold ?? 1), shrink = +(options.shrink ?? 0.95);
    // While pinned no space is added (pinSpacing false), so leave a separate empty distance before the next section rises
    const spacer = document.createElement("div");
    spacer.setAttribute("aria-hidden", "true");
    spacer.style.height = `${room}px`;
    el.after(spacer);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, scroller, start: () => `top ${top()}px`, end: `+=${len}`, scrub, pin: true, pinSpacing: false, ...(!scroller && { pinType: "fixed" }), anticipatePin: 1, invalidateOnRefresh: true },
      });
      if (fades.length) tl.fromTo(fades, { opacity: 1, y: 0 }, { opacity: 0, y: rise, duration: 0.8, stagger: each, ease: "none", immediateRender: false }, 0);
      tl.to(photo, { width: options.to || "100vw", height: options["to-h"] || "100vh", marginLeft: "calc(50% - 50vw)", y: () => -(photo.getBoundingClientRect().top - el.getBoundingClientRect().top), ease: "none", duration: 1, force3D: true }, 0);
      if (hold > 0) tl.to({}, { duration: hold });
      tl.to(photo, { opacity: 0, scale: shrink, ease: "none", duration: 1, force3D: true });
      tl.to(el, { autoAlpha: 0, duration: 0.01 });
    }, el);
    return () => { ctx.revert(); spacer.remove(); };
  });
})();
