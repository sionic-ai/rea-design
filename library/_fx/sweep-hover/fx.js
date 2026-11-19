(() => {
  // On interaction --fx-in goes 0 → 1, on release --fx-out goes 0 → 1 along the same curve (.37s) — CSS shares the two numbers.
  // The underline is drawn in from the left (in) and exits to the right on release (out). The photo grows by in and returns by out.
  // Original (Brand) tweens --hover-start/--hover-end on .hover-trigger from document-wide mouseover·mouseout.
  kfFx.register("sweep-hover", (el, { options, reduce, hover }) => {
    const dur = reduce ? 0 : +(options.dur ?? 0.37);
    const ease = kfFx.ease(options.ease || "0.36,0.04,0.23,1", "power2.out");
    gsap.set(el, { "--fx-in": 0, "--fx-out": 1 });
    if (!hover) return () => gsap.set(el, { clearProps: "--fx-in,--fx-out" });
    const enter = () => { gsap.set(el, { "--fx-in": 0, "--fx-out": 0 }); gsap.to(el, { "--fx-in": 1, duration: dur, ease, overwrite: true }); };
    const leave = () => { gsap.set(el, { "--fx-in": 1, "--fx-out": 0 }); gsap.to(el, { "--fx-out": 1, duration: dur, ease, overwrite: true }); };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focusin", enter);
    el.addEventListener("focusout", leave);
    return () => {
      el.removeEventListener("pointerenter", enter); el.removeEventListener("pointerleave", leave);
      el.removeEventListener("focusin", enter); el.removeEventListener("focusout", leave);
      gsap.killTweensOf(el); gsap.set(el, { clearProps: "--fx-in,--fx-out" });
    };
  });
})();
