(() => {
  kfFx.register("elastic-shrink-hover", (el, { options, reduce, hover }) => {
    const inner = el.querySelector('[data-fx-part="inner"]');
    const icons = [...el.querySelectorAll('[data-fx-part="icon"]')];
    if (!inner && !icons.length) return;
    const shrink = +(options.shrink ?? 0.96), grow = +(options.icon ?? 1.3);
    const sizes = icons.map((i) => +(i.dataset.scale ?? grow));
    const pressOn = (options.press ?? (el.tagName === "BUTTON" ? "on" : "off")) === "on";
    const on = () => {
      if (el.hasAttribute("disabled")) return;
      if (inner) gsap.to(inner, { scale: shrink, duration: 0.7, ease: "power4.out", overwrite: true });
      icons.forEach((i, n) => gsap.to(i, { scale: sizes[n], duration: 0.5, ease: "power4.out", overwrite: true }));
    };
    const out = () => {
      if (el.hasAttribute("disabled")) return;
      if (inner) gsap.to(inner, { scale: 1, duration: 1.6, ease: "elastic.out(1.5, 0.4)", overwrite: true });
      if (icons.length) gsap.to(icons, { scale: 1, duration: 1, ease: "elastic.out(1.2, 0.4)", overwrite: true });
    };
    // On press it shrinks to .8x then bounces back big — the original applies this to button only
    const press = () => { if (inner) gsap.fromTo(inner, { scale: 0.8 }, { scale: 1, duration: 1.7, ease: "elastic.out(2, 0.3)", overwrite: true }); };
    if (reduce) return;
    if (hover) { el.addEventListener("mouseenter", on); el.addEventListener("mouseleave", out); }
    if (pressOn) el.addEventListener("click", press);
    return () => {
      el.removeEventListener("mouseenter", on);
      el.removeEventListener("mouseleave", out);
      el.removeEventListener("click", press);
      gsap.killTweensOf([inner, ...icons].filter(Boolean));
      gsap.set([inner, ...icons].filter(Boolean), { clearProps: "transform" });
    };
  });
})();
