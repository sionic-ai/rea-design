(() => {
  // Original (the ”Today, tomorrow…” section of a terrace site): when the section’s top touches the top of the screen, four stacked portrait photos scatter, each to a different spot,
  // Bottom photos are pushed upward. When leaving the section downward or going back up, they stack again — only state changes, motion is a CSS transition
  kfFx.register("stack-scatter", (el, { options, scroller }) => {
    if (!window.gsap || !window.ScrollTrigger || !el.querySelector('[data-fx-part="photo"]')) return;
    gsap.registerPlugin(ScrollTrigger);
    const scope = (options.scope && el.closest(options.scope)) || el;
    const on = () => el.classList.add("is-fx-open"), off = () => el.classList.remove("is-fx-open");
    const st = ScrollTrigger.create({
      trigger: scope, scroller, start: options.start || "top top", end: options.end || "bottom top",
      onEnter: on, onLeave: options.stay === "true" ? undefined : off, onEnterBack: on, onLeaveBack: off,
    });
    return () => { st.kill(); off(); };
  });
})();
