(() => {
  // Round swatch row (role=radio or data-fx-part="option") Floats a ring on top and carries it to the chosen swatch on a spring.
  // The original (Framer Motion layoutId · spring duration .65 · bounce .25) is integrated as a spring with damping ratio .75 · stiffness 200 · damping 21.3 · mass 1.
  // On pick, move aria-checked and fire fx:pick on that row { value } Fires it. Arrow keys move it too
  kfFx.register("pick-ring-spring", (el, { options, reduce }) => {
    const opts = () => [...el.querySelectorAll('[role="radio"], [data-fx-part="option"]')];
    if (!opts().length) return;
    const ring = document.createElement("span");
    ring.className = "fx-prs-ring";
    ring.setAttribute("aria-hidden", "true");
    el.append(ring);
    const k = +(options.k ?? 200), c = +(options.c ?? 21.3), m = Math.max(+(options.m ?? 1), 0.01);
    const pos = { x: 0, y: 0, vx: 0, vy: 0 }, goal = { x: 0, y: 0 };
    let raf = 0, last = 0, placed = false;
    const where = (o) => ({ x: o.offsetLeft + o.offsetWidth / 2, y: o.offsetTop + o.offsetHeight / 2 });
    const paint = () => { ring.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`; };
    const step = (t) => {
      const dt = last ? Math.min(Math.max(1, t - last), 64) / 1000 : 1 / 60;
      last = t;
      // Integrate in 1ms steps so a strong spring doesn’t jitter with the frame interval
      for (let s = 0, n = Math.ceil(dt * 1000); s < n; s++) {
        const h = dt / n;
        pos.vx += ((-k * (pos.x - goal.x) - c * pos.vx) / m) * h;
        pos.vy += ((-k * (pos.y - goal.y) - c * pos.vy) / m) * h;
        pos.x += pos.vx * h;
        pos.y += pos.vy * h;
      }
      paint();
      const rest = Math.abs(pos.x - goal.x) < 0.01 && Math.abs(pos.y - goal.y) < 0.01 && Math.abs(pos.vx) < 0.01 && Math.abs(pos.vy) < 0.01;
      if (rest) { Object.assign(pos, { x: goal.x, y: goal.y, vx: 0, vy: 0 }); paint(); raf = 0; last = 0; return; }
      raf = requestAnimationFrame(step);
    };
    const moveTo = (o, jump) => {
      Object.assign(goal, where(o));
      ring.hidden = false;
      if (jump || reduce || !placed) {
        cancelAnimationFrame(raf); raf = 0; last = 0;
        Object.assign(pos, { x: goal.x, y: goal.y, vx: 0, vy: 0 });
        placed = true;
        paint();
        return;
      }
      if (!raf) raf = requestAnimationFrame(step);
    };
    const current = () => opts().find((o) => o.getAttribute("aria-checked") === "true");
    const pick = (o, focus) => {
      if (!o || o.getAttribute("aria-checked") === "true") return;
      opts().forEach((x) => { const on = x === o; x.setAttribute("aria-checked", String(on)); x.tabIndex = on ? 0 : -1; });
      if (focus) o.focus();
      moveTo(o);
      el.dispatchEvent(new CustomEvent("fx:pick", { bubbles: true, detail: { value: o.dataset.value ?? o.value ?? "", option: o } }));
    };
    const ac = new AbortController(), on = { signal: ac.signal };
    el.addEventListener("click", (e) => { const o = e.target.closest('[role="radio"], [data-fx-part="option"]'); if (o && el.contains(o)) pick(o); }, on);
    el.addEventListener("keydown", (e) => {
      const list = opts(), i = list.indexOf(current() || list[0]);
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      pick(list[(i + d + list.length) % list.length], true);
    }, on);
    opts().forEach((x) => (x.tabIndex = x.getAttribute("aria-checked") === "true" ? 0 : -1));
    const first = current();
    if (first) moveTo(first, true); else ring.hidden = true;
    // Fonts and line breaks shift the sample slot late, so reseat the ring
    const ro = new ResizeObserver(() => { const o = current(); if (o) moveTo(o, true); });
    ro.observe(el);
    return () => { ac.abort(); ro.disconnect(); cancelAnimationFrame(raf); ring.remove(); };
  });
})();
