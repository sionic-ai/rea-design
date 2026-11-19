// A round button spins over a full turn (default 375°) on hover while swapping its skin, and rewinds along the same path on release. The color to change into is read from .fx-spin-on in css
(() => {
  kfFx.register("spin-swap-hover", (el, { options, reduce, hover }) => {
    if (!hover) return;
    const turn = +(options.turn ?? 375), dur = +(options.dur ?? 0.5), ease = kfFx.ease(options.ease || "back.inOut(2.5)", "back.inOut(2.5)");
    // The Skin may have changed, so re-measure the on-state color on each raise
    const onColors = () => {
      el.classList.add("fx-spin-on", "fx-spin-probe");
      const cs = getComputedStyle(el), c = { backgroundColor: cs.backgroundColor, color: cs.color, borderColor: cs.borderTopColor };
      el.classList.remove("fx-spin-on", "fx-spin-probe");
      return c;
    };
    let tw = null;
    // If it comes back up during the rewind, it spins again from that spot — only re-measure the color after the rewind completes (then the inline color matches the resting color so there is no jump)
    const on = () => {
      if (tw && tw.progress() > 0) return tw.play();
      tw?.kill();
      gsap.set(el, { clearProps: "backgroundColor,color,borderColor" });
      tw = gsap.to(el, { rotation: reduce ? 0 : turn, ...onColors(), duration: reduce ? 0 : dur, ease });
    };
    const off = () => tw?.reverse();
    el.addEventListener("pointerenter", on);
    el.addEventListener("pointerleave", off);
    return () => { el.removeEventListener("pointerenter", on); el.removeEventListener("pointerleave", off); tw?.kill(); gsap.set(el, { clearProps: "transform,backgroundColor,color,borderColor" }); };
  });
})();
