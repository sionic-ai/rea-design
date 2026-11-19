// No ScrollTrigger needed since we only watch for things entering the screen, so turn it on once with IntersectionObserver — if inside an inner scroll panel, use that panel as the root
(() => {
  kfFx.register("strike-draw", (el, { scroller }) => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { el.classList.add("is-in"); io.disconnect(); } }), { root: scroller || null, rootMargin: "0px 0px -10% 0px" });
    io.observe(el);
    return () => { io.disconnect(); el.classList.remove("is-in"); };
  });
})();
