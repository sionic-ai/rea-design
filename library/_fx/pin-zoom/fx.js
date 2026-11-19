(() => {
  kfFx.register("pin-zoom", (el, { options, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const q = (role) => el.querySelectorAll(`[data-fx-part="${role}"]`), mm = gsap.matchMedia();
    // If there is no image to enlarge, no pin is applied either. Sentences, dots and labels may be dropped or added, and since the end position (.9) is fixed, the enlargement ends at the same scroll spot even if they are dropped.
    const zoom = q("zoom"), say = q("say"), pins = q("pin"), labels = q("label");
    if (!zoom.length) return;
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: "top top", end: `+=${+(options.length || 2200)}`, pin: true, scrub: true, anticipatePin: 1 } });
      if (say.length) tl.to(say, { autoAlpha: 0, y: -30, duration: 0.2 }, 0.25);
      tl.to(zoom, { scale: +(options.scale || 4.2), duration: 0.6, ease: "power2.inOut" }, 0.25);
      if (pins.length) tl.from(pins, { scale: 0, transformOrigin: "center", duration: 0.05, stagger: 0.008 }, 0.7);
      if (labels.length) tl.from(labels, { autoAlpha: 0, duration: 0.1 }, 0.8);
      tl.set({}, {}, 0.9);
    });
    // When a pinned element is pulled from the document only the pin-spacer remains, and putting it back makes ScrollTrigger re-insert the removed element in place — so clear the empty spacer first
    return () => { if (!el.isConnected) ScrollTrigger.getAll().forEach((t) => t.pin === el && t.spacer?.remove()); mm.revert(); };
  });
})();
