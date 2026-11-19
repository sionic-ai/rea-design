(() => {
  // Drag the scattered windows and tags from anywhere — they land at random spots inside the board (inset from the edges) and appear at .12s intervals,
  // The grabbed item comes to the front and follows the pointer as is. If it moves no more than 1px before release it counts as a press (links and buttons work as normal).
  let top = 10;
  kfFx.register("drag-front-free", (el, { options, reduce }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const margin = +(options.margin ?? 100);
    const each = +(options.each ?? 0.12);
    const scatter = options.scatter !== "0";
    const pos = items.map(() => ({ x: 0, y: 0 }));
    const put = (it, i) => { it.style.transform = `translate(${pos[i].x}px, ${pos[i].y}px)`; };
    const spread = () => {
      const w = el.clientWidth, h = el.clientHeight;
      items.forEach((it, i) => {
        if (scatter) {
          pos[i].x = Math.random() * Math.max(0, w - 2 * margin) + margin;
          pos[i].y = Math.random() * Math.max(0, h - 2 * margin) + margin;
        }
        put(it, i);
      });
    };
    spread();
    const timers = items.map((it, i) => {
      if (reduce || each === 0) { it.dataset.shown = ""; return 0; }
      return setTimeout(() => { it.dataset.shown = ""; }, each * 1000 * i);
    });
    let last = { w: el.clientWidth, h: el.clientHeight };
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!last.w || !last.h) { last = { w, h }; spread(); return; }
      pos.forEach((p, i) => { p.x *= w / last.w; p.y *= h / last.h; put(items[i], i); });
      last = { w, h };
    });
    ro.observe(el);
    const offs = items.map((it, i) => {
      let start = null;
      let moved = false;
      const down = (e) => {
        if (e.button > 0) return;
        start = { x: e.clientX, y: e.clientY, px: pos[i].x, py: pos[i].y };
        moved = false;
        it.style.zIndex = String(++top);
        it.dataset.grabbing = "";
        it.setPointerCapture?.(e.pointerId);
      };
      const move = (e) => {
        if (!start) return;
        const dx = e.clientX - start.x, dy = e.clientY - start.y;
        if (Math.hypot(dx, dy) > 1) moved = true;
        pos[i].x = start.px + dx;
        pos[i].y = start.py + dy;
        put(it, i);
      };
      const up = () => {
        if (!start) return;
        start = null;
        delete it.dataset.grabbing;
        if (moved) el.dispatchEvent(new CustomEvent("fx:drop", { bubbles: true, detail: { item: it } }));
      };
      const click = (e) => {
        if (!moved) return;
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      };
      it.addEventListener("pointerdown", down);
      it.addEventListener("pointermove", move);
      it.addEventListener("pointerup", up);
      it.addEventListener("pointercancel", up);
      it.addEventListener("click", click, true);
      return () => {
        it.removeEventListener("pointerdown", down);
        it.removeEventListener("pointermove", move);
        it.removeEventListener("pointerup", up);
        it.removeEventListener("pointercancel", up);
        it.removeEventListener("click", click, true);
      };
    });
    return () => {
      timers.forEach(clearTimeout);
      ro.disconnect();
      offs.forEach((f) => f());
      items.forEach((it) => { it.style.transform = ""; it.style.zIndex = ""; delete it.dataset.shown; delete it.dataset.grabbing; });
    };
  });
})();
