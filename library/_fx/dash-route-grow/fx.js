// Original does it on every scroll <style> Rewrite one line to change the ::before height — a negative value makes that line invalid so the last height remains. Keep the same habit
(() => {
  kfFx.register("dash-route-grow", (el, { options, reduce, scroller }) => {
    const clip = el.querySelector('[data-fx-part="clip"]');
    if (!clip) return;
    if (reduce) { el.style.setProperty("--fx-reveal", "100%"); return () => el.style.removeProperty("--fx-reveal"); }
    const lead = +(options.lead ?? 12);
    const src = scroller || window;
    const y = () => (scroller ? scroller.scrollTop : window.scrollY);
    const topOf = (n) => n.getBoundingClientRect().top + y() - (scroller ? scroller.getBoundingClientRect().top : 0);
    const update = () => {
      const top = topOf(el), endEl = options.end ? document.querySelector(options.end) : null;
      const span = (endEl ? topOf(endEl) : top + el.offsetHeight) - top;
      if (span <= 0) return;
      const pct = ((y() - top) / span) * 100 + lead;
      if (pct < 0) return;
      el.style.setProperty("--fx-reveal", Math.min(pct, 100) + "%");
    };
    src.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => { src.removeEventListener("scroll", update); ro.disconnect(); el.style.removeProperty("--fx-reveal"); };
  });
})();
