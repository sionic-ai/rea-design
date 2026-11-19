(() => {
  // The lit board over the dimmed photo ([data-fx-part=on]) hidden, and on hover the panel fills diagonally from below (right side first, up to halfway) then spreads out into a rectangle —
  // .45s Power3.in → .45s Power3.out. On release it lifts away slanting upward and the panel hides below again. Enter and exit are chained in one timeline so they never break
  const P = (a) => `polygon(${a[0]}% ${a[1]}%, ${a[2]}% ${a[3]}%, ${a[4]}% ${a[5]}%, ${a[6]}% ${a[7]}%)`;
  kfFx.register("slant-wipe-hover", (el, { options, reduce, hover }) => {
    if (!window.gsap) return;
    const on = el.querySelector('[data-fx-part="on"]');
    if (!on) return;
    const s = Math.min(100, Math.max(0, +(options.slant ?? 50)));
    const HIDE = P([0, 100, 100, 100, 100, 100, 0, 100]);
    const IN1 = P([0, 0, 100, s, 100, 100, 0, 100]), FULL = P([0, 0, 100, 0, 100, 100, 0, 100]);
    const OUT1 = P([0, 0, 100, 0, 100, s, 0, 0]), OUT2 = P([0, 0, 100, 0, 100, 0, 0, 0]);
    const half = +(options.dur ?? 0.45);
    const easeIn = kfFx.ease(options["ease-in"] || "power3.in", "power3.in"), easeOut = kfFx.ease(options["ease-out"] || "power3.out", "power3.out");
    gsap.set(on, { clipPath: HIDE });
    if (reduce || !hover) return () => gsap.set(on, { clearProps: "clipPath" });
    const tl = gsap.timeline();
    const enter = () => { tl.to(on, { clipPath: IN1, duration: half, ease: easeIn }).to(on, { clipPath: FULL, duration: half, ease: easeOut }); };
    const leave = () => { tl.to(on, { clipPath: OUT1, duration: half, ease: easeIn }).to(on, { clipPath: OUT2, duration: half, ease: easeOut, onComplete: () => gsap.set(on, { clipPath: HIDE }) }); };
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    return () => { el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave); tl.kill(); if (on.isConnected) gsap.set(on, { clearProps: "clipPath" }); };
  });
})();
