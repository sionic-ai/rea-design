(() => {
  // On hover it tilts 3° around the chosen corner (default bottom right) (.2s power3.out) and returns straight to 0° without waiting for release (.2s power3.in).
  // The original removes tilt on touch screens and applies only the return, so there is no movement — hence it is not attached without hover
  kfFx.register("corner-nod-hover", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const angle = +(options.angle ?? 3), dur = +(options.dur ?? 0.2), back = +(options.back ?? dur);
    const origin = options.origin || "right bottom";
    const easeIn = kfFx.ease(options.ease || "power3.out", "power3.out");
    const easeBack = kfFx.ease(options["ease-back"] || "power3.in", "power3.in");
    const before = el.style.transformOrigin;
    const nod = () => {
      el.style.transformOrigin = origin;
      gsap.killTweensOf(el, "rotate");
      gsap.timeline()
        .to(el, { rotate: angle, duration: dur, ease: easeIn })
        .to(el, { rotate: 0, duration: back, ease: easeBack });
    };
    el.addEventListener("mouseenter", nod);
    return () => {
      el.removeEventListener("mouseenter", nod);
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "rotate" });
      el.style.transformOrigin = before;
    };
  });
})();
