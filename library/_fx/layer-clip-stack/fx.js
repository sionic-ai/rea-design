// Layers (text panel) and images are stacked inside a pinned section, and each scroll covers one layer up from the bottom — while the new image opens from below, the previous image rolls up and away.
// If there are more layers than images, the remaining layers get the last image’s progress (fx:frame detail.progress 0→1) (the original has a frame bundle there).
(() => {
  kfFx.register("layer-clip-stack", (el, { options, reduce, scroller }) => {
    const pinEl = el.querySelector('[data-fx-part="pin"]') || el;
    const layers = [...el.querySelectorAll('[data-fx-part="layer"]')];
    const images = [...el.querySelectorAll('[data-fx-part="image"]')];
    if (layers.length < 2) return;
    const narrow = matchMedia("(max-width: 767px)").matches;
    const pin = +(narrow ? options["pin-narrow"] ?? 600 : options.pin ?? 800);
    const run = +(narrow ? options["run-narrow"] ?? 400 : options.run ?? 600);
    const ease = kfFx.ease(options.ease || "power2.inOut", "power2.inOut");
    const shut = "inset(100% 0% 0% 0%)", open = "inset(0% 0% 0% 0%)", gone = "inset(0% 0% 100% 0%)";
    const state = { progress: 0 };
    const emit = () => el.dispatchEvent(new CustomEvent("fx:frame", { detail: { progress: state.progress } }));
    if (reduce) {
      gsap.set(layers.slice(1).concat(images.slice(1)), { clipPath: open });
      state.progress = 1;
      emit();
      return () => gsap.set(layers.concat(images), { clearProps: "clipPath" });
    }
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(layers.slice(1).concat(images.slice(1)), { clipPath: shut });
      ScrollTrigger.create({ trigger: el, scroller, pin: pinEl, start: "top top", end: `+=${pin}%`, pinSpacing: false, invalidateOnRefresh: true, anticipatePin: 1 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, scroller, start: "top top", end: `+=${run}%`, scrub: true, invalidateOnRefresh: true } });
      layers.forEach((layer, n) => {
        if (n === 0) return;
        tl.fromTo(layer, { clipPath: shut }, { clipPath: open, duration: 1, ease, immediateRender: false });
        if (n < images.length) {
          tl.fromTo(images[n], { clipPath: shut }, { clipPath: open, duration: 1, ease, immediateRender: false }, "<");
          tl.fromTo(images[n - 1], { clipPath: open }, { clipPath: gone, duration: 1, ease, immediateRender: false }, "<");
        } else {
          tl.to(state, { progress: 1, duration: 1, ease: "none", onUpdate: emit }, "<");
        }
      });
      emit();
    });
    return () => { mm.revert(); gsap.set(layers.concat(images), { clearProps: "clipPath" }); };
  });
})();
