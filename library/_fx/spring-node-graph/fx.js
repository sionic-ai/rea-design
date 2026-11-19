(() => {
  // Original make-diagram: drag a node on the circle and it follows the hand exactly, and the endpoints and control points of the two connected curves move together.
  // On release it springs back into place (stiffness 180 · damping 12 · max step 1/30s), and stops below .3px distance and 3px/s speed.
  // If dragged more than 6px, block the link navigation of that press.
  kfFx.register("spring-node-graph", (el, { options, reduce }) => {
    const svg = el.querySelector("svg");
    const nodes = [...el.querySelectorAll('[data-fx-part="node"][data-key]')];
    if (!nodes.length) return;
    const stiff = +(options.stiff ?? 180), damp = +(options.damp ?? 12), slop = +(options.slop ?? 6);
    const view = svg?.viewBox?.baseVal?.width || 100;
    const lines = [...el.querySelectorAll('[data-fx-part="line"][data-from][data-to]')].map((p) => ({
      p,
      from: p.dataset.from,
      to: p.dataset.to,
      pts: (p.dataset.points || "").split(/\s+/).map(Number),
    }));
    const ac = new AbortController();
    const on = { signal: ac.signal };
    const loops = new Map();

    const place = (key, node, at) => {
      node.style.setProperty("--drag-x", `${at.x.toFixed(1)}px`);
      node.style.setProperty("--drag-y", `${at.y.toFixed(1)}px`);
      const k = view / (svg?.clientWidth || el.clientWidth || 1);
      const dx = at.x * k, dy = at.y * k;
      for (const l of lines) {
        if (l.from !== key && l.to !== key) continue;
        const [a = 0, b = 0, c = 0, d = 0, e = 0, f = 0, g = 0, h = 0] = l.pts;
        const s = l.from === key ? [a + dx, b + dy, c + dx, d + dy] : [a, b, c, d];
        const t = l.to === key ? [e + dx, f + dy, g + dx, h + dy] : [e, f, g, h];
        const [x1, y1, x2, y2] = s.map((v) => v.toFixed(2));
        const [x3, y3, x4, y4] = t.map((v) => v.toFixed(2));
        l.p.setAttribute("d", `M ${x1} ${y1} C ${x2} ${y2} ${x3} ${y3} ${x4} ${y4}`);
      }
    };

    nodes.forEach((node) => {
      const key = node.dataset.key;
      let id = null, grab = { x: 0, y: 0 }, at = { x: 0, y: 0 }, moved = false;
      const spring = () => {
        let v = { x: 0, y: 0 }, last = performance.now();
        const step = (now) => {
          const dt = Math.min(Math.max(0, (now - last) / 1000), 1 / 30);
          last = now;
          v.x += (-stiff * at.x - damp * v.x) * dt;
          v.y += (-stiff * at.y - damp * v.y) * dt;
          at = { x: at.x + v.x * dt, y: at.y + v.y * dt };
          if (Math.hypot(at.x, at.y) < 0.3 && Math.hypot(v.x, v.y) < 3) {
            at = { x: 0, y: 0 };
            place(key, node, at);
            loops.delete(key);
            return;
          }
          place(key, node, at);
          loops.set(key, requestAnimationFrame(step));
        };
        loops.set(key, requestAnimationFrame(step));
      };
      node.addEventListener("dragstart", (e) => e.preventDefault(), on);
      node.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        const r = loops.get(key);
        if (r !== undefined) cancelAnimationFrame(r);
        id = e.pointerId;
        grab = { x: e.clientX - at.x, y: e.clientY - at.y };
        moved = false;
        node.setPointerCapture(e.pointerId);
        node.classList.add("is-dragging");
      }, on);
      node.addEventListener("pointermove", (e) => {
        if (e.pointerId !== id) return;
        at = { x: e.clientX - grab.x, y: e.clientY - grab.y };
        if (Math.hypot(at.x, at.y) > slop) moved = true;
        place(key, node, at);
      }, on);
      const drop = (e) => {
        if (e.pointerId !== id) return;
        id = null;
        node.classList.remove("is-dragging");
        if (reduce) {
          at = { x: 0, y: 0 };
          place(key, node, at);
          return;
        }
        spring();
      };
      node.addEventListener("pointerup", drop, on);
      node.addEventListener("pointercancel", drop, on);
      node.addEventListener("click", (e) => {
        if (!moved) return;
        e.preventDefault();
        e.stopPropagation();
      }, on);
    });

    return () => {
      ac.abort();
      for (const r of loops.values()) cancelAnimationFrame(r);
      loops.clear();
      nodes.forEach((n) => {
        n.classList.remove("is-dragging");
        n.style.removeProperty("--drag-x");
        n.style.removeProperty("--drag-y");
      });
      for (const l of lines) {
        const [a, b, c, d, e, f, g, h] = l.pts;
        if (l.pts.length === 8) l.p.setAttribute("d", `M ${a} ${b} C ${c} ${d} ${e} ${f} ${g} ${h}`);
      }
    };
  });
})();
