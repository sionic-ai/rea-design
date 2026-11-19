(() => {
  // The full name wordmark shows, then after delay seconds only the initials remain and the other letters (data-fx-part="letter") disappear one by one in --i order.
  // On hover the folded letters turn back on in the same order, and fold again on release (CSS). Letters can be HTML text or SVG tspan
  kfFx.register("initials-collapse", (el, { options, reduce }) => {
    if (!el.querySelector('[data-fx-part="letter"]')) return;
    const n = (v, d) => (Number.isFinite(+v) ? +v : d);
    el.style.setProperty("--fx-dur", `${n(options.dur, 0.2)}s`);
    el.style.setProperty("--fx-each", `${n(options.each, 0.018)}s`);
    if (options.ease) el.style.setProperty("--fx-ease", String(options.ease).includes(",") ? `cubic-bezier(${options.ease})` : options.ease);
    const fold = () => el.classList.add("is-folded");
    if (reduce) { el.classList.add("is-folded", "is-still"); return () => el.classList.remove("is-folded", "is-still"); }
    const t = setTimeout(fold, n(options.delay, 2) * 1000);
    return () => { clearTimeout(t); el.classList.remove("is-folded"); ["--fx-dur", "--fx-each", "--fx-ease"].forEach((v) => el.style.removeProperty(v)); };
  });
})();
