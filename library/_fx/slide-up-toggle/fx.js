(() => {
  // Original slide-on-scroll: adds is-visible when visible, removes it when not — so it rises again when scrolling back up
  kfFx.register("slide-up-toggle", (el, { options, reduce, scroller }) => {
    if (reduce) { el.classList.add("is-fx-in"); return () => el.classList.remove("is-fx-in"); }
    const y = +(options.y ?? 100), m = +(options.margin ?? 100), once = options.once === "true";
    el.style.setProperty("--fx-y", `${y}px`);
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      el.classList.toggle("is-fx-in", e.isIntersecting || (once && el.classList.contains("is-fx-in")));
    }), { root: scroller && scroller !== window ? scroller : null, rootMargin: `${m}px 0px`, threshold: 0 });
    io.observe(el);
    return () => { io.disconnect(); el.classList.remove("is-fx-in"); el.style.removeProperty("--fx-y"); };
  });
})();
