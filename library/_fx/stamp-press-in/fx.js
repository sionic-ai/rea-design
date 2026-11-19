(() => {
  // When an element enters the screen (original: 30% visible in the screen minus the bottom 5%) add .is-fx-on and run the stamp effect once
  kfFx.register("stamp-press-in", (el, { options, reduce }) => {
    if (reduce) { el.classList.add("is-fx-on"); return () => el.classList.remove("is-fx-on"); }
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      el.classList.add("is-fx-on");
      io.disconnect();
    }), { rootMargin: options.margin || "0px 0px -5% 0px", threshold: +(options.threshold ?? 0.3) });
    io.observe(el);
    return () => { io.disconnect(); el.classList.remove("is-fx-on"); };
  });
})();
