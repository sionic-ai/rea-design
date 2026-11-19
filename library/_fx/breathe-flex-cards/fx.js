(() => {
  // The original (Name’s three News items) sets the current cell to 5, the one before to 4, the one after to 3, and pushes one cell every 3.6s — hovering makes that cell 5 and stops, and leaving the row resumes from that spot
  kfFx.register("breathe-flex-cards", (el, { options, reduce, hover }) => {
    const cards = [...el.querySelectorAll(':scope > [data-fx-part="card"]')];
    if (cards.length < 3) return;
    const n = cards.length, every = +(options.every || 3.6);
    let i = Math.min(n - 1, Math.max(0, Math.round(+(options.start ?? 2)))), held = false, seen = false, timer = 0;
    const paint = () => cards.forEach((c, k) => {
      c.classList.toggle("fx-flex5", k === i);
      c.classList.toggle("fx-flex4", k === (i - 1 + n) % n);
    });
    paint();
    const tick = () => { if (!held && seen && !reduce) { i = (i + 1) % n; paint(); } };
    if (!reduce) timer = setInterval(tick, every * 1000);
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (!seen) held = false; });
    io.observe(el);
    const ac = new AbortController(), on = { signal: ac.signal };
    const pick = (k) => { if (!seen) return; held = true; i = k; paint(); };
    cards.forEach((c, k) => {
      if (hover) c.addEventListener("mouseenter", () => pick(k), on);
      c.addEventListener("focusin", () => pick(k), on);
    });
    el.addEventListener("mouseleave", () => { held = false; }, on);
    el.addEventListener("focusout", (e) => { if (!el.contains(e.relatedTarget)) held = false; }, on);
    return () => { clearInterval(timer); io.disconnect(); ac.abort(); cards.forEach((c) => c.classList.remove("fx-flex4", "fx-flex5")); };
  });
})();
