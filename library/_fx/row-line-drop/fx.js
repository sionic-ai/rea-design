(() => {
  kfFx.register("row-line-drop", (el, { options, reduce }) => {
    const rows = [...el.querySelectorAll('[data-fx-part="row"]')];
    if (!rows.length) return;
    const step = +(options.each ?? 0.1);
    rows.forEach((r, i) => r.style.setProperty("--fx-delay-base", (i * step).toFixed(3) + "s"));
    let io;
    if (reduce) el.classList.add("is-in");
    else {
      io = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (e.isIntersecting) { el.classList.add("is-in"); io.disconnect(); }
      }), { rootMargin: options.margin || "0% 10% -25% 10%", threshold: 0 });
      io.observe(el);
    }
    return () => { io?.disconnect(); el.classList.remove("is-in"); rows.forEach((r) => r.style.removeProperty("--fx-delay-base")); };
  });
})();
