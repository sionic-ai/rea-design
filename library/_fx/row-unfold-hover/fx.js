(() => {
  // List row — stands at its collapsed height (default 230px), and when hovered expands to full height over .4s power3.inOut, pushing the rows below down, then collapses back the same distance on release.
  // Touch devices stay expanded (there is no way to hover)
  kfFx.register("row-unfold-hover", (el, { options, reduce, hover }) => {
    if (!hover) return;
    const closed = +(options.closed ?? 230), dur = reduce ? 0 : +(options.dur ?? 0.4);
    const ease = !options.ease ? "power3.inOut" : /^[\d.,\s-]+$/.test(options.ease) ? kfFx.ease(options.ease, "power3.inOut") : options.ease;
    gsap.set(el, { height: closed, overflow: "hidden" });
    const on = () => gsap.to(el, { height: "auto", duration: dur, ease, overwrite: true });
    const off = () => gsap.to(el, { height: closed, duration: dur, ease, overwrite: true });
    el.addEventListener("pointerenter", on);
    el.addEventListener("pointerleave", off);
    el.addEventListener("focusin", on);
    el.addEventListener("focusout", off);
    return () => {
      el.removeEventListener("pointerenter", on);
      el.removeEventListener("pointerleave", off);
      el.removeEventListener("focusin", on);
      el.removeEventListener("focusout", off);
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "height,overflow" });
    };
  });
})();
