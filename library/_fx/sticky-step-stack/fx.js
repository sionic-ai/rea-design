// The sticky position of each row steps down one notch so the previous row’s head (title) stays while the next row sticks beneath it and stacks — pure sticky, so it works even when the scroll panel is inside.
// Reduces the height by the same amount per line so the line bottoms release at nearly one spot (original 1100~1120px). When lines are added or removed, step numbers are renumbered
(() => {
  kfFx.register("sticky-step-stack", (el, { options }) => {
    const set = (k, v) => v != null && v !== "" && el.style.setProperty(`--fx-${k}`, /^-?[\d.]+$/.test(v) ? `${v}px` : v);
    set("top", options.top); set("step", options.step); set("height", options.height); set("shrink", options.shrink);
    // fill: none — the row background is not painted. Where only titles stack into a table of contents (Brand site), the photo behind must show through
    set("fill", options.fill);
    const items = () => [...el.querySelectorAll(':scope > [data-fx-part="item"]')];
    const number = () => items().forEach((it, i) => it.style.setProperty("--fx-i", i));
    number();
    const mo = new MutationObserver(number);
    mo.observe(el, { childList: true });
    return () => {
      mo.disconnect();
      items().forEach((it) => it.style.removeProperty("--fx-i"));
      ["top", "step", "height", "shrink", "fill"].forEach((k) => el.style.removeProperty(`--fx-${k}`));
    };
  });
})();
