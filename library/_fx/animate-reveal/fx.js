// Same order as WOW.js — hide it first (visibility hidden, animation-name none), and once any bit of the element enters the screen, attach the animate.css effect name and animated
(() => {
  kfFx.register("animate-reveal", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    const name = options.name || "fadeIn";
    const offset = +(options.offset ?? 0);
    const s = el.style;
    s.visibility = "hidden";
    s.animationName = "none";
    if (options.delay != null) s.animationDelay = `${+options.delay}s`;
    if (options.dur != null) s.animationDuration = `${+options.dur}s`;
    if (options.repeat) s.animationIterationCount = options.repeat;
    const show = () => { s.visibility = "visible"; s.animationName = ""; el.classList.add("animated", name); };
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { show(); io.disconnect(); }
    }, { root: scroller || null, rootMargin: `0px 0px ${-offset}px 0px`, threshold: 0 });
    io.observe(el);
    return () => {
      io.disconnect();
      el.classList.remove("animated", name);
      for (const k of ["visibility", "animationName", "animationDelay", "animationDuration", "animationIterationCount"]) s[k] = "";
    };
  });
})();
