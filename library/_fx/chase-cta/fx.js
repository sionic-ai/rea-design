// Button inside the panel that follows the cursor with a delay — returns to center on leave (play button, 1s expo.out)
(() => {
  kfFx.register("chase-cta", (el, { options, reduce, hover }) => {
    const host = el.parentElement;
    if (reduce || !hover || !host) return;
    const dur = +(options.dur ?? 1), ease = kfFx.ease(options.ease || "expo.out", "expo.out");
    const qx = gsap.quickTo(el, "x", { duration: dur, ease }), qy = gsap.quickTo(el, "y", { duration: dur, ease });
    const move = (e) => { const r = host.getBoundingClientRect(); qx(e.clientX - r.left - r.width / 2); qy(e.clientY - r.top - r.height / 2); };
    const leave = () => { qx(0); qy(0); };
    host.addEventListener("mousemove", move);
    host.addEventListener("mouseleave", leave);
    return () => { host.removeEventListener("mousemove", move); host.removeEventListener("mouseleave", leave); gsap.killTweensOf(el); gsap.set(el, { clearProps: "x,y" }); };
  });
})();
