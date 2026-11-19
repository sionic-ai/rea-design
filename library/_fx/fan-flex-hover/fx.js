// Among horizontally lined cells, the hovered one widens (flex grow) and the rest fold into grayscale · faint, leaving only vertical names. On touch, pressing opens that cell.
(() => {
  kfFx.register("fan-flex-hover", (el, { options, hover }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const grow = options.grow ?? "3.4", dur = options.dur ?? "0.7";
    el.style.setProperty("--fx-fan-grow", grow);
    el.style.setProperty("--fx-fan-dur", `${dur}s`);
    const start = Math.min(items.length - 1, Math.max(0, +(options.start ?? 0)));
    const open = (li) => items.forEach((o) => o.classList.toggle("is-on", o === li));
    if (!items.some((i) => i.classList.contains("is-on"))) open(items[start]);
    const ac = new AbortController(), on = { signal: ac.signal };
    items.forEach((li) => {
      if (hover) li.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && open(li), on);
      li.addEventListener("click", (e) => { if (!li.classList.contains("is-on")) { if (!hover) e.preventDefault(); open(li); } }, on);
    });
    return () => { ac.abort(); items.forEach((i) => i.classList.remove("is-on")); el.style.removeProperty("--fx-fan-grow"); el.style.removeProperty("--fx-fan-dur"); };
  });
})();
