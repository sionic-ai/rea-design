// Hovering one cell wraps every cell of the same group (data-key) row by row in a design-tool selection frame (1px accent color + four corner handles) — the Work cell
(() => {
  kfFx.register("group-select-frame", (el, { hover }) => {
    if (!hover) return;
    const tiles = () => [...el.querySelectorAll('[data-fx-part="tile"]')];
    if (!tiles().length) return;
    let current = null, boxes = [];
    const media = (list) => list.flatMap((t) => [...t.querySelectorAll("video")]);
    const clear = () => {
      boxes.forEach((b) => b.remove());
      boxes = [];
      const on = tiles().filter((t) => t.classList.contains("is-active"));
      // When you let go, the bundled video plays again
      media(on).forEach((v) => v.play?.().catch?.(() => {}));
      on.forEach((t) => t.classList.remove("is-active"));
      el.classList.remove("is-hovering");
    };
    const draw = (key) => {
      clear();
      const group = tiles().filter((t) => t.getAttribute("data-key") === key);
      if (!group.length) return;
      el.classList.add("is-hovering");
      group.forEach((t) => t.classList.add("is-active"));
      media(group).forEach((v) => v.pause?.());
      const g = el.getBoundingClientRect();
      const rows = new Map();
      group.forEach((t) => {
        const r = t.getBoundingClientRect(), k = Math.round(r.top);
        if (!rows.has(k)) rows.set(k, []);
        rows.get(k).push(t);
      });
      rows.forEach((row) => {
        let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
        row.forEach((t) => {
          const r = t.getBoundingClientRect(), label = t.querySelector('[data-fx-part="label"]');
          left = Math.min(left, r.left); right = Math.max(right, r.right); bottom = Math.max(bottom, r.bottom);
          top = Math.min(top, label ? label.getBoundingClientRect().top : r.top);
        });
        const box = document.createElement("div");
        box.className = "fx-select-box";
        box.setAttribute("aria-hidden", "true");
        box.innerHTML = "<i></i><i></i><i></i><i></i>";
        Object.assign(box.style, { left: `${left - g.left}px`, top: `${top - g.top}px`, width: `${right - left}px`, height: `${bottom - top}px` });
        el.append(box);
        boxes.push(box);
      });
      el.dispatchEvent(new CustomEvent("fx:select", { detail: key }));
    };
    // Gaps between cells still count as inside the frame, so the group is not released
    const inside = (e) => boxes.some((b) => {
      const r = b.getBoundingClientRect();
      return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    });
    const off = () => { if (current != null) { current = null; clear(); el.dispatchEvent(new CustomEvent("fx:select", { detail: null })); } };
    const move = (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      const tile = e.target.closest?.('[data-fx-part="tile"]');
      if (tile && el.contains(tile)) {
        const key = tile.getAttribute("data-key");
        if (key !== current) { current = key; draw(key); }
      } else if (current != null && !inside(e)) off();
    };
    // Clicking the gap also goes to the first cell link of that group
    const click = (e) => {
      if (current == null || e.target.closest?.('[data-fx-part="tile"]')) return;
      const first = tiles().find((t) => t.getAttribute("data-key") === current);
      const link = first && (first.closest("a[href]") || first.querySelector("a[href]"));
      if (link) link.click();
    };
    const resize = () => { if (current != null) draw(current); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", off);
    el.addEventListener("click", click);
    addEventListener("resize", resize);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", off);
      el.removeEventListener("click", click);
      removeEventListener("resize", resize);
      current = null;
      clear();
    };
  });
})();
