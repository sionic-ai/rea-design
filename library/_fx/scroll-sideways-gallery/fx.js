// The photo row inside a vertically scrolling panel is flowed sideways — the panel’s inner height is used as the photo row width, and on every scroll the panel’s scrollLeft is driven from scrollTop with gsap.to(.5s power1.out)
// The row trails behind to the left as you scroll down. On narrow screens (outside min) nothing is attached, so photos stay stacked vertically and scroll normally
(() => {
  kfFx.register("scroll-sideways-gallery", (el, { options, reduce }) => {
    const inner = el.querySelector('[data-fx-part="inner"]'), track = el.querySelector('[data-fx-part="track"]');
    if (!inner || !track) return;
    const min = options.min || "1024px", dur = +(options.dur ?? 0.5), ease = kfFx.ease(options.ease || "power1.out", "power1.out");
    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${min})`, () => {
      el.classList.add("is-sideways");
      const size = () => gsap.set(inner, { height: track.offsetWidth });
      const sync = () => (reduce || !dur ? (el.scrollLeft = el.scrollTop) : gsap.to(el, { scrollLeft: el.scrollTop, duration: dur, ease, overwrite: true }));
      size();
      const ro = new ResizeObserver(size);
      ro.observe(track);
      el.addEventListener("scroll", sync, { passive: true });
      return () => { ro.disconnect(); el.removeEventListener("scroll", sync); gsap.killTweensOf(el); gsap.set(inner, { clearProps: "height" }); el.classList.remove("is-sideways"); el.scrollLeft = 0; };
    });
    return () => mm.revert();
  });
})();
