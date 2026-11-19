// On a panel covered with a blur veil (backdrop blur + faint shade), only a circle around the cursor is punched through so the photo·video beneath shows clearly.
// The circle position follows --fx-x and --fx-y .4s late, on enter the radius opens to 150px in .2s, and on leave it closes to 1px
(() => {
  kfFx.register("blur-hole-cursor", (el, { options, reduce, hover }) => {
    const veil = el.querySelector('[data-fx-part="veil"]');
    if (!veil || reduce || !hover) return;
    const r = +(options.r ?? 150), lag = +(options.lag ?? 0.4), open = +(options.open ?? 0.2), shift = +(options.shift ?? 50);
    gsap.set(veil, { "--fx-x": "1px", "--fx-y": "1px", "--fx-r": "1px" });
    const qx = gsap.quickTo(veil, "--fx-x", { duration: lag }), qy = gsap.quickTo(veil, "--fx-y", { duration: lag });
    const enter = () => gsap.to(veil, { "--fx-r": r + "px", duration: open });
    // The original places the circle 50px up and to the left of the cursor (it opens in front of the fingertip, not under the hand)
    const move = (e) => { const b = el.getBoundingClientRect(); qx(e.clientX - b.left - shift); qy(e.clientY - b.top - shift); };
    const leave = () => gsap.to(veil, { "--fx-r": "1px", duration: open });
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
      gsap.killTweensOf(veil);
      gsap.set(veil, { clearProps: "--fx-x,--fx-y,--fx-r" });
    };
  });
})();
