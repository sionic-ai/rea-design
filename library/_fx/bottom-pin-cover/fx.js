// When the section bottom touches the screen bottom, the inner panel is pinned to the screen bottom — the section space stays, so the next section (panel with higher z) covers it and rises over it.
// Back in place when scrolled back up. When the end element enters below the screen, the whole section is erased in .5s (so the fixed panel doesn’t show through between lower sections). Original seesaw setupFixedScrollSections
(() => {
  kfFx.register("bottom-pin-cover", (el, { options, scroller }) => {
    const pin = el.querySelector('[data-fx-part="pin"]');
    if (!pin) return;
    const narrow = matchMedia(`(max-width: ${options.narrow || 768}px)`);
    const size = () => gsap.set(pin, { height: narrow.matches ? "100dvh" : el.getBoundingClientRect().height });
    gsap.set(pin, { position: "absolute", top: 0, left: 0, width: "100%" });
    size();
    const st = ScrollTrigger.create({
      trigger: el,
      scroller: scroller || undefined,
      start: "bottom bottom",
      onEnter: () => gsap.set(pin, { position: "fixed", top: "auto", bottom: 0, left: 0 }),
      onLeaveBack: () => gsap.set(pin, { position: "absolute", top: 0, bottom: "auto", left: 0 }),
    });
    const endEl = options.end ? document.querySelector(options.end) : null;
    const st2 = endEl ? ScrollTrigger.create({
      trigger: endEl,
      scroller: scroller || undefined,
      start: "top bottom",
      onEnter: () => gsap.to(el, { opacity: 0, duration: +(options.fade ?? 0.5) }),
      onLeaveBack: () => gsap.to(el, { opacity: 1, duration: +(options.fade ?? 0.5) }),
    }) : null;
    const ro = new ResizeObserver(() => { size(); ScrollTrigger.refresh(); });
    ro.observe(el);
    return () => { ro.disconnect(); st.kill(); st2?.kill(); gsap.killTweensOf(el); gsap.set(pin, { clearProps: "all" }); gsap.set(el, { clearProps: "opacity" }); };
  });
})();
