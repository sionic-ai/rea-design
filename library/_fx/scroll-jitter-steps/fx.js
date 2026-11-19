// Only while scrolling, the element jolts with no in-between values (steps(1)) between 0° ↔ an angle every .25s, and .15s after scrolling stops it returns to 0° in .3s.
(() => {
  kfFx.register("scroll-jitter-steps", (el, { options, reduce }) => {
    if (reduce) return;
    const deg = +(options.deg ?? 10), beat = +(options.beat ?? 0.25), idle = +(options.idle ?? 150);
    let tw = null, timer = 0;
    const stop = () => { tw?.kill(); tw = null; gsap.to(el, { rotation: 0, duration: 0.3, ease: "steps(1)" }); };
    const on = () => {
      clearTimeout(timer);
      if (!tw) tw = gsap.to(el, { rotation: deg, yoyo: true, repeat: -1, duration: beat, ease: "steps(1)", yoyoEase: "steps(1)" });
      timer = setTimeout(stop, idle);
    };
    addEventListener("scroll", on, { passive: true });
    return () => { removeEventListener("scroll", on); clearTimeout(timer); tw?.kill(); gsap.set(el, { clearProps: "rotate,transform" }); };
  });
})();
