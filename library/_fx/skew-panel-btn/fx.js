(() => {
  // The original runs the panel with three classes (e entering · o leaving · none at rest) — a panel that has left must return outside to the right with no transition after .4s so the next entry again comes from the right
  kfFx.register("skew-panel-btn", (el, { options, reduce, hover }) => {
    if (reduce) return;
    const hold = +(options.hold ?? 0.4) * 1000;
    let tOut = 0, tIn = 0;
    const enter = () => {
      clearTimeout(tIn);
      if (el.classList.contains("fx-skew-panel-btn-o")) tIn = setTimeout(() => el.classList.add("fx-skew-panel-btn-e"), hold);
      else el.classList.add("fx-skew-panel-btn-e");
    };
    const leave = () => {
      clearTimeout(tIn); clearTimeout(tOut);
      if (!el.classList.contains("fx-skew-panel-btn-e")) return;
      el.classList.add("fx-skew-panel-btn-o");
      el.classList.remove("fx-skew-panel-btn-e");
      tOut = setTimeout(() => el.classList.remove("fx-skew-panel-btn-o"), hold);
    };
    const area = (options.area && el.closest(options.area)) || el;
    if (hover) { area.addEventListener("pointerenter", enter); area.addEventListener("pointerleave", leave); }
    el.addEventListener("focusin", enter);
    el.addEventListener("focusout", leave);
    return () => {
      clearTimeout(tIn); clearTimeout(tOut);
      area.removeEventListener("pointerenter", enter);
      area.removeEventListener("pointerleave", leave);
      el.removeEventListener("focusin", enter);
      el.removeEventListener("focusout", leave);
      el.classList.remove("fx-skew-panel-btn-e", "fx-skew-panel-btn-o");
    };
  });
})();
