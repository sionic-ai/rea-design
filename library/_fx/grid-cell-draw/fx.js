// Folds away the thin lines of one grid row (top horizontal line, right end line, left line per cell), then unfolds them all at once when the row top rises above 98% of the screen.
// Cell lines start each sec later per cell order so the rows seem to be drawn from left to right — the delay is given per cell via --fx-d
(() => {
  kfFx.register("grid-cell-draw", (el, { options, reduce }) => {
    const cells = [...el.querySelectorAll(':scope > [data-fx-part="cell"]')];
    const each = +(options.each ?? 0.06), start = +(options.start ?? 98);
    cells.forEach((c, i) => c.style.setProperty("--fx-d", `${(i * each).toFixed(2)}s`));
    if (reduce) return () => cells.forEach((c) => c.style.removeProperty("--fx-d"));
    el.classList.add("fx-grid-hide");
    let raf = 0;
    const io = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      io.disconnect();
      raf = requestAnimationFrame(() => el.classList.remove("fx-grid-hide"));
    }, { rootMargin: `0px 0px -${100 - start}% 0px` });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.classList.remove("fx-grid-hide");
      cells.forEach((c) => c.style.removeProperty("--fx-d"));
    };
  });
})();
