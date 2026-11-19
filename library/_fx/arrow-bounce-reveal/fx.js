(() => {
  kfFx.register("arrow-bounce-reveal", (el, { options, reduce, scroller }) => {
    if (reduce || !window.ScrollTrigger) { el.classList.add("is-fx-in"); return () => el.classList.remove("is-fx-in"); }
    gsap.registerPlugin(ScrollTrigger);
    // Original IntersectionObserver bottom −12% — an element is drawn only once it rises 12% from the bottom of the screen
    const st = ScrollTrigger.create({
      trigger: el, scroller, start: options.start || "top 88%", once: true,
      onEnter: () => el.classList.add("is-fx-in"),
    });
    return () => { st.kill(); el.classList.remove("is-fx-in"); };
  });
})();
