(() => {
  // Hides the hand-drawn line (path) by its own length, and draws it once when the panel’s top edge passes the 80% line of the screen — the drawn curve and length are handled by fx.css
  // Here each line is measured and given dasharray and dashoffset plus data-on. The arrowhead (head) slides into place at the same moment.
  kfFx.register("scribble-draw-enter", (el, { options, reduce }) => {
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')].filter((p) => typeof p.getTotalLength === "function");
    if (!lines.length) return;
    lines.forEach((p) => {
      const len = Math.ceil(p.getTotalLength()) + 1;
      p.style.setProperty("--fx-len", len);
      p.style.strokeDasharray = len;
    });
    const on = () => el.setAttribute("data-on", "");
    if (reduce) { on(); return () => el.removeAttribute("data-on"); }
    const hook = +(options.hook ?? 0.8);
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { on(); io.disconnect(); } }), { rootMargin: `0px 0px ${-(1 - hook) * 100}% 0px` });
    io.observe(el);
    return () => {
      io.disconnect();
      el.removeAttribute("data-on");
      lines.forEach((p) => { p.style.removeProperty("--fx-len"); p.style.strokeDasharray = ""; });
    };
  });
})();
