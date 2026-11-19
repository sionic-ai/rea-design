// Gives each panel a --fx-p progress from 0 when the panel touches the bottom of the screen to 1 when the panel end passes the top of the screen — growing and pushing are drawn by CSS from that value
(() => {
  kfFx.register("clip-title-stack", (el, { options, reduce, scroller }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    el.style.setProperty("--fx-zoom", +(options.zoom ?? 0.1));
    el.style.setProperty("--fx-shift", `${+(options.shift ?? 30)}%`);
    if (reduce) return () => el.style.removeProperty("--fx-zoom");
    const sts = items.map((it) => ScrollTrigger.create({
      trigger: it, scroller, start: "top bottom", end: "bottom top",
      onUpdate: (st) => it.style.setProperty("--fx-p", st.progress.toFixed(4)),
      onRefresh: (st) => it.style.setProperty("--fx-p", st.progress.toFixed(4)),
    }));
    return () => {
      sts.forEach((s) => s.kill());
      items.forEach((it) => it.style.removeProperty("--fx-p"));
      el.style.removeProperty("--fx-zoom"); el.style.removeProperty("--fx-shift");
    };
  });
})();
