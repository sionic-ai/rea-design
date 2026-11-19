(() => {
  kfFx.register("split-pin-copy", (el, { options, reduce, scroller }) => {
    const light = el.querySelector('[data-fx-part="light"]');
    if (!light) return;
    const edgeEl = options.edge ? document.querySelector(options.edge) : el.parentElement;
    const untilEl = options.until ? document.querySelector(options.until) : null;
    const gap = +(options.gap ?? 40);
    const split = () => {
      if (!edgeEl) return;
      const edge = edgeEl.getBoundingClientRect().bottom;
      const r = light.getBoundingClientRect();
      if (!r.height) return;
      el.style.setProperty("--fx-split", Math.min(100, Math.max(0, ((edge - r.top) / r.height) * 100)) + "%");
    };
    if (reduce || !untilEl) {
      split();
      addEventListener("scroll", split, { passive: true });
      return () => { removeEventListener("scroll", split); el.style.removeProperty("--fx-split"); };
    }
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const st = ScrollTrigger.create({
        trigger: edgeEl || el, scroller: scroller || window, start: "top top",
        endTrigger: untilEl, end: () => "top " + (el.getBoundingClientRect().bottom - (scroller ? scroller.getBoundingClientRect().top : 0) + gap),
        pin: el, pinSpacing: false, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: split, onRefresh: split, onEnterBack: split,
        onLeave: () => el.style.setProperty("--fx-split", "0%"),
      });
      return () => st.kill();
    });
    return () => { mm.revert(); el.style.removeProperty("--fx-split"); };
  });
})();
