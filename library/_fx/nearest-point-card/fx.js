// Moving the cursor over the panel lights the single closest point within radius (110px) — that point’s card (same data-key) pops up, and
// Zones of the same group (data-group) darken, and lines touching that point brighten. Every line receives --near (0~1) from the distance between the cursor and the line center.
// On touch, pressing a dot turns it on and pressing outside turns it off. On keyboard, focus on a dot turns it on.
(() => {
  kfFx.register("nearest-point-card", (el, { options, hover }) => {
    const points = [...el.querySelectorAll('[data-fx-part="point"]')];
    if (!points.length) return;
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')];
    const groups = [...el.querySelectorAll('[data-fx-part="group"]')];
    const radius = +options.radius || 110;
    const glow = +options.glow || 0;
    const ac = new AbortController(), on = { signal: ac.signal };
    let active = null, raf = 0;
    const set = (key) => {
      if (key === active) return;
      active = key;
      const p = points.find((x) => x.dataset.key === key);
      el.classList.toggle("is-fx-active", !!p);
      points.forEach((x) => { x.classList.toggle("is-active", x === p); x.setAttribute("aria-expanded", String(x === p)); });
      cards.forEach((c) => { const v = !!p && c.dataset.key === key; c.classList.toggle("is-visible", v); c.setAttribute("aria-hidden", String(!v)); });
      groups.forEach((g) => g.classList.toggle("is-active", !!p && g.dataset.key === p.dataset.group));
      lines.forEach((l) => l.classList.toggle("is-active", !!p && (l.dataset.a === key || l.dataset.b === key)));
    };
    const center = (n) => { const r = n.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
    el.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch" || e.target.closest('[data-fx-part="card"]')) return;
      let best = null, d = radius;
      points.forEach((p) => { const dot = p.querySelector('[data-fx-part="dot"]') || p, [x, y] = center(dot), k = Math.hypot(x - e.clientX, y - e.clientY); if (k < d) { d = k; best = p.dataset.key; } });
      set(best);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const g = glow || el.clientWidth * 0.1625;
        lines.forEach((l) => { const [x, y] = center(l); l.style.setProperty("--near", Math.max(0, 1 - Math.hypot(x - e.clientX, y - e.clientY) / g).toFixed(3)); });
      });
    }, on);
    el.addEventListener("pointerleave", () => { set(null); lines.forEach((l) => l.style.setProperty("--near", 0)); }, on);
    points.forEach((p) => {
      p.addEventListener("focus", () => set(p.dataset.key), on);
      p.addEventListener("click", () => set(active === p.dataset.key ? null : p.dataset.key), on);
    });
    if (!hover) el.addEventListener("click", (e) => { if (!e.target.closest('[data-fx-part="point"], [data-fx-part="card"]')) set(null); }, on);
    return () => {
      ac.abort();
      cancelAnimationFrame(raf);
      set(null);
      lines.forEach((l) => l.style.removeProperty("--near"));
    };
  });
})();
