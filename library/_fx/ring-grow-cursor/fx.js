// Original Brand cursor-ring: the ring follows by .22 of the remaining distance each frame, grows to 52px over links · buttons, and over a data-cursor cell becomes a 76px glass circle showing its text.
// Magnet targets (main buttons) are pulled toward the cursor up to x ±6, y ±4px (distance × .12).
(() => {
  let live = 0;
  kfFx.register("ring-grow-cursor", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const lerp = +(options.lerp ?? 0.22) || 0.22;
    const pull = +(options.pull ?? 0.12);
    const targets = options.targets || 'a, button, [role="button"], input, select, textarea, label, summary, .swiper';
    const magnet = options.magnet || "[data-magnet]";
    const label = el.querySelector('[data-fx-part="label"]');
    const root = document.documentElement;
    live += 1;
    root.classList.add("fx-ring-cursor");
    let tx = -100, ty = -100, x = -100, y = -100, on = false, stuck = null, raf = 0;
    const move = (e) => { tx = e.clientX; ty = e.clientY; if (!on) { on = true; el.classList.add("is-on"); } };
    const down = () => el.classList.add("is-down");
    const up = () => el.classList.remove("is-down");
    const leave = () => { on = false; el.classList.remove("is-on"); };
    const over = (e) => {
      const t = e.target.closest ? e.target : null;
      if (!t) return;
      const lab = t.closest("[data-cursor]");
      if (lab) { if (label) label.textContent = lab.getAttribute("data-cursor"); el.classList.add("is-label"); el.classList.remove("is-hover"); }
      else { el.classList.toggle("is-hover", !!t.closest(targets)); el.classList.remove("is-label"); }
      const m = t.closest(magnet);
      if (m !== stuck) { if (stuck) stuck.style.translate = ""; stuck = m; }
    };
    const tick = () => {
      x += lerp * (tx - x); y += lerp * (ty - y);
      el.style.translate = `${x}px ${y}px`;
      if (stuck) {
        const r = stuck.getBoundingClientRect(), dx = tx - (r.left + r.width / 2), dy = ty - (r.top + r.height / 2);
        if (Math.abs(dx) < r.width && Math.abs(dy) < r.height) stuck.style.translate = `${Math.max(-6, Math.min(6, pull * dx))}px ${Math.max(-4, Math.min(4, pull * dy))}px`;
        else { stuck.style.translate = ""; stuck = null; }
      }
      raf = requestAnimationFrame(tick);
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerdown", down);
    document.addEventListener("pointerup", up);
    document.addEventListener("pointerover", over, { passive: true });
    root.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("pointerover", over);
      root.removeEventListener("pointerleave", leave);
      if (--live <= 0) root.classList.remove("fx-ring-cursor");
      if (stuck) stuck.style.translate = "";
      el.classList.remove("is-on", "is-down", "is-hover", "is-label");
      el.style.translate = "";
    };
  });
})();
