// Hollow-text row marquee: hovering a big list row (a finger presses) lights up that row — the still title clears and the same name flows as a row-width marquee (22s),
// Below, a strip of detail items flows in reverse (28s). The active row widens its vertical margins and its number dot blinks faster — Brand’s specialty field
(() => {
  kfFx.register("ghost-row-marquee", (el, { options, reduce, hover }) => {
    const rows = [...el.querySelectorAll('[data-fx-part="row"]')];
    if (!rows.length) return;
    const set = (r, on) => r.classList.toggle("is-fx-on", on);
    const offs = [];
    rows.forEach((r) => {
      if (hover) {
        const a = () => set(r, true), b = () => set(r, false);
        r.addEventListener("pointerenter", a); r.addEventListener("pointerleave", b);
        offs.push(() => { r.removeEventListener("pointerenter", a); r.removeEventListener("pointerleave", b); });
      } else {
        const t = () => { const on = !r.classList.contains("is-fx-on"); rows.forEach((o) => set(o, false)); set(r, on); };
        r.addEventListener("click", t);
        offs.push(() => r.removeEventListener("click", t));
      }
    });
    if (options.speed) el.style.setProperty("--fx-marquee", `${+options.speed}s`);
    return () => { offs.forEach((f) => f()); rows.forEach((r) => set(r, false)); el.style.removeProperty("--fx-marquee"); };
  });
})();
