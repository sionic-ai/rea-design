// Hovering a card pops it to pop x (default 1.13) in .2s easeOutCubic, then settles to rest x (default 1.1) in .8s on a spring curve,
// The second photo (alt) laid over the first turns on at .08s. On release it presses down to .985x for .15s and returns to 1x with a .8s spring, and the second photo turns off in .15s easeOutQuad.
// spring is the named curve of Velocity 1.2 as is — 1 − cos(4.5πp)·e^(−6p). Brand hiring interview card
(() => {
  const spring = (p) => 1 - Math.cos(4.5 * p * Math.PI) * Math.exp(-6 * p);
  kfFx.register("spring-pop-swap", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const alt = el.querySelector('[data-fx-part="alt"]');
    const pop = +(options.pop ?? 1.13), rest = +(options.rest ?? 1.1), dur = +(options.dur ?? 0.8);
    const cubic = kfFx.ease("0.215,0.61,0.355,1", "power2.out"), quad = kfFx.ease("0.25,0.46,0.45,0.94", "power1.out");
    let tl;
    const on = () => {
      tl && tl.kill();
      tl = gsap.timeline().to(el, { scale: pop, duration: 0.2, ease: cubic }).to(el, { scale: rest, duration: dur, ease: spring });
      if (alt) gsap.to(alt, { opacity: 1, duration: 0.08, ease: cubic, overwrite: true });
    };
    const off = () => {
      tl && tl.kill();
      tl = gsap.timeline().to(el, { scale: 0.985, duration: 0.15, ease: "none" }).to(el, { scale: 1, duration: dur, ease: spring });
      if (alt) gsap.to(alt, { opacity: 0, duration: 0.15, ease: quad, overwrite: true });
    };
    el.addEventListener("pointerenter", on);
    el.addEventListener("pointerleave", off);
    return () => {
      el.removeEventListener("pointerenter", on);
      el.removeEventListener("pointerleave", off);
      tl && tl.kill();
      gsap.set([el, alt].filter(Boolean), { clearProps: "transform,opacity" });
    };
  });
})();
