// The frame’s initial margin and corners are set by the consuming css — the part resets them to 0 (restoring the css values on reverse) and only items marked together fade
(() => {
  kfFx.register("frame-fill-toggle", (el, { options, reduce, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const frame = el.querySelector('[data-fx-part="frame"]');
    if (!frame) return;
    const fades = [...el.querySelectorAll('[data-fx-part="fade"]')];
    const dur = +(options.dur ?? 1.4), fade = +(options.fade ?? 0.5);
    const ease = kfFx.ease(options.ease || "power4.inOut", "power4.inOut");
    const fadeEase = kfFx.ease(options["fade-ease"] || options.ease || "power4.inOut", "power4.inOut");
    // With reduced motion, it switches at the same threshold with no movement
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: options.start || "bottom bottom-=10%", toggleActions: "play none none reverse" },
    });
    tl.to(frame, { borderRadius: 0, marginTop: 0, marginLeft: 0, marginRight: 0, width: "100%", duration: reduce ? 0 : dur, ease });
    if (fades.length) tl.to(fades, { opacity: 0, duration: reduce ? 0 : fade, ease: fadeEase }, "<");
    return () => { tl.scrollTrigger?.kill(); tl.kill(); gsap.set([frame, ...fades], { clearProps: "borderRadius,marginTop,marginLeft,marginRight,width,opacity" }); };
  });
})();
