(() => {
  // At the very top it hangs large (at-top size · side offset), then once scrolled even slightly (10px by default) it shrinks to its own size (rest) over 1.2s, and grows again when back at the top
  kfFx.register("pin-shrink-scroll", (el, { options, reduce, scroller }) => {
    const topScale = +(options.top ?? 1.35), topX = +(options.topx ?? -18), restScale = +(options.rest ?? 0.75), restX = +(options.restx ?? 0);
    const dur = +(options.dur ?? 1.2), gap = +(options.gap ?? 10);
    const ease = options.ease ? kfFx.ease(options.ease, "power1.out") : "power1.out";
    const box = scroller || window;
    const y = () => (scroller ? scroller.scrollTop : scrollY);
    let down = null;
    const go = (d) => { if (d === down) return; down = d; gsap.to(el, { scale: d ? restScale : topScale, xPercent: d ? restX : topX, duration: reduce ? 0 : dur, ease, overwrite: "auto" }); };
    gsap.set(el, { scale: topScale, xPercent: topX });
    const on = () => go(y() > gap);
    on();
    box.addEventListener("scroll", on, { passive: true });
    return () => { box.removeEventListener("scroll", on); gsap.killTweensOf(el); gsap.set(el, { clearProps: "transform" }); };
  });
})();
