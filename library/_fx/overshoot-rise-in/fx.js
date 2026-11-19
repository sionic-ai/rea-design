(() => {
  kfFx.register("overshoot-rise-in", (el, { options, reduce, scroller }) => {
    const parts = el.querySelectorAll('[data-fx-part="item"]');
    const items = parts.length ? [...parts] : [...el.children];
    if (!items.length || reduce) return;
    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const y = +(options.y ?? 100), first = +(options.first ?? 0.23), each = +(options.each ?? 0.08), off = +(options.offset ?? 80);
      const ease = kfFx.ease("0.175,0.885,0.32,1.03", "back.out(1.2)");
      gsap.set(items, { y, opacity: 0, transformOrigin: "top center" });
      const show = () => items.forEach((it, i) => {
        gsap.to(it, { y: 0, duration: 1, ease, delay: first + each * i, overwrite: "auto" });
        gsap.to(it, { opacity: 1, duration: 0.15, ease: "none", delay: first + each * i });
      });
      const hide = () => gsap.set(items, { y, opacity: 0, overwrite: true });
      ScrollTrigger.create({ scroller, trigger: el, start: `top+=${-off} bottom`, end: `bottom+=${-off} top`, onEnter: show, onLeaveBack: hide });
    }, el);
    return () => ctx.revert();
  });
})();
