// Corkscrew text line: each child line gets an order (--i) for animation-delay = Make it start + step × index (the original goes from −21.5s in .5s steps, so with 78 lines the last is 17s).
// Re-attach to late-added lines too. Length and spacing open up as options.
(() => {
  kfFx.register("corkscrew-lines", (el, { options, reduce }) => {
    const dur = +(options.dur ?? 39) || 39;
    const step = +(options.step ?? 0.5);
    const start = +(options.start ?? -21.5);
    el.style.setProperty("--fx-dur", `${dur}s`);
    el.style.setProperty("--fx-step", `${step}s`);
    el.style.setProperty("--fx-start", `${start}s`);
    if (options.pause === "hover") el.style.setProperty("--fx-hover-state", "paused");
    const apply = () => {
      if (reduce) return;
      [...el.children].forEach((li, i) => { if (li.style.getPropertyValue("--i") !== String(i)) li.style.setProperty("--i", i); });
    };
    apply();
    const mo = new MutationObserver(apply);
    mo.observe(el, { childList: true });
    return () => {
      mo.disconnect();
      el.style.removeProperty("--fx-dur");
      el.style.removeProperty("--fx-step");
      el.style.removeProperty("--fx-start");
      el.style.removeProperty("--fx-hover-state");
    };
  });
})();
