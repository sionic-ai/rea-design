// Default STUDIO reveal — appears once when the element’s top edge crosses the 90% line (10% above the screen bottom).
// fade is opacity 0→1 1.2s cubic-bezier(.13,.62,.37,.95), pop is scale 0→1 .45s cubic-bezier(.12,1.12,.63,1.19) (.1s late, overshoots then settles)
(() => {
  kfFx.register("studio-appear", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    const at = +(options.at ?? 90);
    el.classList.add("fx-studio-appear-wait");
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      el.classList.add("is-in");
      io.disconnect();
    }), { root: scroller || null, rootMargin: `0px 0px ${-(100 - at)}% 0px` });
    io.observe(el);
    return () => { io.disconnect(); el.classList.remove("fx-studio-appear-wait", "is-in"); };
  });
})();
