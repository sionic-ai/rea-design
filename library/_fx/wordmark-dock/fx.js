(() => {
  kfFx.register("wordmark-dock", (el, { options, scroller }) => {
    if (!window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const mark = el.querySelector('[data-fx-part="mark"]');
    if (!mark) return;
    // From the moment the wordmark’s top edge touches the screen top until the end, pinned as a group — no space is added so the section below rises as is.
    // The shrinking is a CSS transition (.6s), so it shrinks and expands in one go regardless of scroll speed
    const st = ScrollTrigger.create({
      trigger: mark, scroller, start: options.start || "top top", end: "max",
      pin: el, pinSpacing: false,
      onEnter: () => el.classList.add("is-docked"),
      onLeaveBack: () => el.classList.remove("is-docked"),
    });
    return () => { st.revert(); el.classList.remove("is-docked"); };
  });
})();
