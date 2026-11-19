// Hero photo and wordmark trail behind the scroll — each is pushed down by its own height × value times the progress p (0~1) while the frame is on screen.
// p is (scroll − start) ÷ (window height + frame height), where start = max(frame top − window height, 0). Tied directly to scroll with no curve (original parallaxImg fixed-top).
(() => {
  kfFx.register("sink-hero-parallax", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    const frame = el.closest('[data-fx-part="frame"]') || el.parentElement;
    if (!frame) return;
    const value = +(options.value ?? 0.5);
    const min = +(options.min ?? 0);
    const ownRange = options.range === "frame";
    const box = scroller || null;
    const sy = () => (box ? box.scrollTop : window.scrollY);
    const vh = () => (box ? box.clientHeight : innerHeight);
    let start = 0, span = 1, amount = 0, on = innerWidth >= min;
    const measure = () => {
      on = innerWidth >= min;
      const top = frame.getBoundingClientRect().top + sy() - (box ? box.getBoundingClientRect().top : 0);
      // range: frame — From when the frame’s top edge hits the top of the screen until its bottom edge hits it (ScrollTrigger top top → bottom top)
      start = ownRange ? Math.max(top, 0) : Math.max(top - vh(), 0);
      span = (ownRange ? frame.offsetHeight : vh() + frame.offsetHeight) || 1;
      amount = el.offsetHeight * value;
    };
    const tick = () => {
      if (!on) { el.style.transform = ""; return; }
      const y = sy();
      if (y < start || y > start + span) return;
      el.style.transform = `translateY(${(amount * Math.min(1, Math.max(0, (y - start) / span))).toFixed(2)}px)`;
    };
    measure();
    tick();
    const ro = new ResizeObserver(() => { measure(); tick(); });
    ro.observe(frame);
    ro.observe(el);
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); ro.disconnect(); el.style.transform = ""; };
  });
})();
