(() => {
  kfFx.register("slide-settle-in", (el, { options, reduce, scroller }) => {
    const vars = { x: "--fx-x", y: "--fx-y", rotate: "--fx-rotate", origin: "--fx-origin", delay: "--fx-delay" };
    for (const [k, v] of Object.entries(vars)) {
      if (options[k] == null) continue;
      const unit = k === "rotate" ? "deg" : k === "delay" ? "s" : k === "origin" ? "" : "%";
      el.style.setProperty(v, /^-?[\d.]+$/.test(options[k]) ? `${options[k]}${unit}` : options[k]);
    }
    const clear = () => Object.values(vars).forEach((v) => el.style.removeProperty(v));
    if (reduce) { el.classList.add("is-fx-in", "is-fx-still"); return () => { el.classList.remove("is-fx-in", "is-fx-still"); clear(); }; }
    // Original js-inview — fires once when the top edge crosses the 25% line from the screen bottom
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      el.classList.add("is-fx-in");
      io.disconnect();
    }), { root: scroller || null, rootMargin: options.margin || "0px 0px -25% 0px" });
    io.observe((options.zone && el.closest(options.zone)) || el);
    return () => { io.disconnect(); el.classList.remove("is-fx-in"); clear(); };
  });
})();
