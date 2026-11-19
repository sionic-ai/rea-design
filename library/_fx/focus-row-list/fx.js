// In a list of stacked large text lines, only the line crossing the screen center line lights up dark and the rest stay faint. If paired media exist, only the media of the same index is shown.
// A row under interaction takes priority over scroll (on release it returns to the scroll row).
(() => {
  kfFx.register("focus-row-list", (el, { options, reduce, hover, scroller }) => {
    const rows = [...el.querySelectorAll('[data-fx-part="row"]')];
    if (!rows.length) return;
    const media = [...el.querySelectorAll('[data-fx-part="media"]')];
    el.style.setProperty("--fx-dim", options.dim ?? "0.1");
    let scrolled = 0, hovered = -1;
    const paint = () => {
      const on = hovered >= 0 ? hovered : scrolled;
      rows.forEach((r, i) => r.classList.toggle("is-on", i === on));
      media.forEach((m, i) => m.classList.toggle("is-on", i === on));
    };
    paint();
    const sts = rows.map((r, i) => ScrollTrigger.create({ scroller, trigger: r, start: options.start || "top center", end: options.end || "bottom center", onToggle: (s) => { if (s.isActive) { scrolled = i; paint(); } } }));
    const enter = (e) => { hovered = rows.indexOf(e.currentTarget); paint(); };
    const leave = () => { hovered = -1; paint(); };
    if (hover && options.hover !== "false") rows.forEach((r) => { r.addEventListener("mouseenter", enter); r.addEventListener("mouseleave", leave); });
    return () => {
      sts.forEach((s) => s.kill());
      rows.forEach((r) => { r.removeEventListener("mouseenter", enter); r.removeEventListener("mouseleave", leave); r.classList.remove("is-on"); });
      media.forEach((m) => m.classList.remove("is-on"));
      el.style.removeProperty("--fx-dim");
    };
  });
})();
