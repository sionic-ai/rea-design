(() => {
  kfFx.register("heart-pop-beat", (el, { options, reduce }) => {
    if (reduce) { el.classList.add("fx-pop"); return () => el.classList.remove("fx-pop"); }
    const delay = +(options.delay ?? 0) * 1000, beat = +(options.beat ?? 1.6) * 1000;
    const timers = [];
    const go = () => {
      timers.push(setTimeout(() => el.classList.add("fx-pop"), delay));
      timers.push(setTimeout(() => el.classList.add("fx-beat"), delay + beat));
    };
    let io = null;
    if (options.on === "enter") {
      io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.disconnect(); go(); } }), { rootMargin: "0px 0px -10% 0px" });
      io.observe(el);
    } else go();
    return () => { timers.forEach(clearTimeout); io?.disconnect(); el.classList.remove("fx-pop", "fx-beat"); };
  });
})();
