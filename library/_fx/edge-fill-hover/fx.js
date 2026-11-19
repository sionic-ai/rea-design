// From the side the pointer entered (top half of the element means top, bottom half means bottom), the background panel (data-fx-part="bg") fills over 1s expo.out and the text color changes.
// On leaving, the plate folds toward where the hand left — up if it exits up, down if it exits down.
(() => {
  kfFx.register("edge-fill-hover", (el, { options, reduce, hover }) => {
    const bg = el.querySelector('[data-fx-part="bg"]');
    if (!bg || !hover) return;
    const dur = reduce ? 0 : +(options.dur ?? 1);
    const ease = kfFx.ease(options.ease || "0.19,1,0.22,1", "expo.out");
    const style = getComputedStyle(el);
    const ink = () => style.getPropertyValue("--fx-fill-ink").trim();
    const rest = () => style.getPropertyValue("--fx-rest-ink").trim();
    gsap.set(bg, { scaleY: 0 });
    const side = (e) => (e.offsetY < el.getBoundingClientRect().height / 2 ? "top" : "bottom");
    const kill = () => gsap.killTweensOf([el, bg]);
    const enter = (e) => {
      kill();
      gsap.set(bg, { transformOrigin: side(e) });
      gsap.to(bg, { scaleY: 1, duration: dur, ease });
      if (ink()) gsap.to(el, { color: ink(), duration: dur, ease });
    };
    const leave = (e) => {
      kill();
      gsap.to(bg, { scaleY: 0, transformOrigin: side(e), duration: dur, ease });
      if (rest()) gsap.to(el, { color: rest(), duration: dur, ease });
    };
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
      kill();
      gsap.set(bg, { clearProps: "transform,transformOrigin" });
      gsap.set(el, { clearProps: "color" });
    };
  });
})();
