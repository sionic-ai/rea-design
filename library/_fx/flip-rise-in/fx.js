// Buttons·cards enter flipped (rotateY -180°, 1.1x) from 90px below, turn to the front in 1.6s and settle in place with a 1.2s back — .15s stagger per panel.
// Each time it reaches 75% of the screen it plays from the start, reversed when scrolling back up. Cannot be pressed while spinning
(() => {
  kfFx.register("flip-rise-in", (el, { options, reduce, scroller }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length || reduce) return;
    const each = +(options.each ?? 0.15), ease = kfFx.ease(options.ease || "0.16,1,0.3,1", "expo.out"), back = options.back || "back.out(1.4)";
    gsap.set(items, { y: +(options.rise ?? 90), scale: 1.1, rotateY: -180, autoAlpha: 0, pointerEvents: "none" });
    const tl = gsap.timeline({ paused: true });
    tl.to(items, { autoAlpha: 1, duration: 0.2, ease: "power1.in", stagger: { each } })
      .to(items, { rotateY: 0, scale: 1, duration: +(options.dur ?? 1.6), ease, stagger: { each } }, "<")
      .to(items, { y: 0, duration: +(options["rise-dur"] ?? 1.2), ease: back, stagger: { each }, onComplete: () => gsap.set(items, { pointerEvents: "auto" }) }, "<");
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({ scroller, trigger: el, start: options.start || "top 75%", onEnter: () => tl.restart(), onLeaveBack: () => tl.reverse() });
    return () => { st.kill(); tl.kill(); gsap.set(items, { clearProps: "all" }); };
  });
})();
