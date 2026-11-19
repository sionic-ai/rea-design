// Of many narrow columns only one is open wide — the hovered column widens (image and text switch on .2s later) while the others narrow,
// Leaving the row returns to the first column. On touch screens, the pressed column opens (and doesn’t return).
(() => {
  kfFx.register("hover-widen-columns", (el, { options, hover }) => {
    const cols = [...el.querySelectorAll('[data-fx-part="col"]')];
    if (!cols.length) return;
    const home = Math.min(cols.length - 1, Math.max(0, +(options.open ?? 0)));
    for (const [k, v] of [["w", "--fx-w"], ["open-w", "--fx-open"]]) if (options[k] != null) el.style.setProperty(v, options[k]);
    for (const [k, v] of [["dur", "--fx-dur"], ["lag", "--fx-lag"]]) if (options[k] != null) el.style.setProperty(v, `${+options[k]}s`);
    const only = (n) => cols.forEach((c, i) => c.classList.toggle("is-open", i === n));
    only(home);
    const offs = [];
    const on = (t, type, fn) => { t.addEventListener(type, fn); offs.push(() => t.removeEventListener(type, fn)); };
    cols.forEach((c, i) => {
      if (hover) {
        on(c, "pointerenter", (e) => e.pointerType === "mouse" && only(i));
        on(c, "pointerleave", (e) => e.pointerType === "mouse" && only(home));
      } else on(c, "click", () => only(i));
      on(c, "focusin", () => only(i));
    });
    on(el, "focusout", (e) => !el.contains(e.relatedTarget) && only(home));
    return () => { offs.forEach((f) => f()); cols.forEach((c) => c.classList.remove("is-open")); ["--fx-w", "--fx-open", "--fx-dur", "--fx-lag"].forEach((v) => el.style.removeProperty(v)); };
  });
})();
