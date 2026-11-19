// Center proximity push row: in a vertical thumbnail row, cells nearer the screen’s vertical center are pushed sideways — if distance d is within range, (1 − d/range)² × max px,
// Follows that value each frame with lerp(.08). Adds is-active to the nearest cell and fx:active (event detail = Cell order) is displayed — Name gallery
// For a horizontal row (axis: x), it is pushed up relative to the screen center (horizontal) (thumbnail strip under the phone gallery)
(() => {
  kfFx.register("center-nudge-list", (el, { options, reduce, scroller }) => {
    const list = () => [...el.querySelectorAll(':scope [data-fx-part="item"]')];
    if (!list().length) return;
    const horiz = options.axis === "x";
    const max = +(options.max ?? (horiz ? 24 : 64)), range = +(options.range || (horiz ? 220 : 280)), k = +(options.lerp ?? 0.08);
    const pos = new Map();
    let raf = 0, active = null;
    const frame = () => {
      const view = scroller ? scroller.getBoundingClientRect() : { top: 0, left: 0, width: innerWidth, height: innerHeight };
      const c = horiz ? view.left + view.width / 2 : view.top + view.height / 2;
      let best = null, bestD = Infinity;
      // Rescan every frame so cells that enter late or leave are still tracked (original gallery 20~60 cells)
      const items = list();
      items.forEach((it) => {
        const r = it.getBoundingClientRect();
        // Shifting happens sideways only, so the measuring axis (y of the vertical line) is unaffected by shifting
        const m = horiz ? r.left + r.width / 2 : r.top + r.height / 2;
        const d = Math.abs(m - c);
        const u = d < range ? (1 - d / range) ** 2 * max : 0;
        const h = reduce ? 0 : (pos.get(it) || 0) + (u - (pos.get(it) || 0)) * Math.min(1, k);
        pos.set(it, h);
        it.style.translate = horiz ? `0 ${-h}px` : `${h}px 0`;
        if (d < bestD) { bestD = d; best = it; }
      });
      if (best !== active) {
        active?.classList.remove("is-active");
        best?.classList.add("is-active");
        active = best;
        el.dispatchEvent(new CustomEvent("fx:active", { bubbles: true, detail: items.indexOf(best) }));
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); list().forEach((it) => { it.style.removeProperty("translate"); it.classList.remove("is-active"); }); };
  });
})();
