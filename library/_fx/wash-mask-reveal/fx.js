(() => {
  // Original is ScrollTrigger start "top 100%" onEnter and onEnterBack add the class once and never remove it — when the top edge touches the bottom of the screen
  kfFx.register("wash-mask-reveal", (el, { options, reduce, scroller }) => {
    if (options.dur != null) el.style.setProperty("--fx-dur", +options.dur + "s");
    if (options.delay != null) el.style.setProperty("--fx-delay", +options.delay + "s");
    const show = () => el.classList.add("is-fx-washed");
    let io = null;
    if (reduce) show();
    else {
      io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { show(); io.disconnect(); } }), { root: scroller || null });
      io.observe(el);
    }
    return () => { io?.disconnect(); el.classList.remove("is-fx-washed"); el.style.removeProperty("--fx-dur"); el.style.removeProperty("--fx-delay"); };
  });
})();
