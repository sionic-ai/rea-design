(() => {
  // The original uses ScrollTrigger.batch(start "top 80%") attaches is_visible, and removes it when scrolling back up (onLeaveBack) — with back: false only once
  kfFx.register("tilt-rise-in", (el, { options, reduce, scroller }) => {
    const show = () => el.classList.add("is-fx-in");
    if (reduce || !window.ScrollTrigger) { show(); return () => el.classList.remove("is-fx-in"); }
    const back = options.back !== "false";
    const st = ScrollTrigger.create({
      trigger: el,
      scroller: scroller || undefined,
      start: options.start || "top 80%",
      onEnter: show,
      onLeaveBack: () => back && el.classList.remove("is-fx-in"),
    });
    return () => { st.kill(); el.classList.remove("is-fx-in"); };
  });
})();
