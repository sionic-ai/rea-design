(() => {
  // Original heartbeat: a 2.26s keyframe that goes from translucent and blurred to sharp at once, blurs slightly, then settles
  const BEAT = [
    { opacity: 0.5, filter: "blur(10px)", offset: 0, easing: "linear" },
    { opacity: 0.5, filter: "blur(10px)", offset: 0.044, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    { opacity: 1, filter: "blur(0px)", offset: 0.08, easing: "cubic-bezier(0.37, 0, 0.63, 1)" },
    { opacity: 0.92, filter: "blur(2px)", offset: 0.115, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    { opacity: 1, filter: "blur(0px)", offset: 1 },
  ];
  kfFx.register("heartbeat-in", (el, { options, reduce }) => {
    if (reduce) { el.classList.add("is-fx-beaten"); return () => el.classList.remove("is-fx-beaten"); }
    const dur = +(options.dur ?? 2.26) * 1000, each = +(options.each ?? 0.15) * 1000, delay = +(options.delay ?? 0) * 1000;
    const parts = el.querySelectorAll('[data-fx-part="beat"]');
    const kids = parts.length ? [...parts] : [el];
    const runs = [];
    const beat = () => {
      el.classList.add("is-fx-beaten");
      kids.forEach((k, i) => runs.push(k.animate(BEAT, { duration: dur, delay: delay + each * i, fill: "backwards" })));
    };
    let io = null;
    if (options.on === "load") beat();
    else {
      io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); beat(); } }, { rootMargin: "0px 0px -10% 0px", threshold: 0.2 });
      io.observe(el);
    }
    return () => { io?.disconnect(); runs.forEach((a) => a.cancel()); el.classList.remove("is-fx-beaten"); };
  });
})();
