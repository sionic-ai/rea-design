(() => {
  // Original (Site news list · directionhover.js thumbnail type): the photo attached to each row stays fixed in the bottom right corner of the screen, and
  // Opens with clip in .45s from the side the interaction entered (top half·bottom half), closes toward the side it left, then rests for 450ms.
  // Moving to another row keeps the previous photo and stacks the new photo on top to open it. Photo interiors are always scaled to 1.08 and shift ±4.5px opposite the mouse position within the row.
  const HIDE = { top: "inset(0 0 100% 0)", bottom: "inset(100% 0 0 0)" };
  let layer = 10;
  kfFx.register("corner-clip-thumb", (el, { options, hover, reduce }) => {
    const rows = [...el.querySelectorAll('[data-fx-part="row"]')];
    if (!hover || !rows.length) return () => {};
    const dur = +(options.dur ?? 0.45);
    const ease = options.ease || "cubic-bezier(0.22, 1, 0.36, 1)";
    const rest = +(options.rest ?? 450);
    const range = +(options.range ?? 4.5);
    if (options.zoom != null) el.style.setProperty("--fx-zoom", String(+options.zoom));
    const timers = new Map();
    const offs = [];
    const parts = (row) => {
      const thumb = row.querySelector('[data-fx-part="thumb"]');
      return thumb ? { thumb, clip: thumb.querySelector('[data-fx-part="clip"]') || thumb, media: thumb.querySelector('[data-fx-part="media"]') } : null;
    };
    const side = (row, e) => {
      const r = row.getBoundingClientRect();
      return e.clientY - r.top < r.height / 2 ? "top" : "bottom";
    };
    const shift = (row, p, e) => {
      if (!p.media || reduce) return;
      const r = row.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      const y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      p.media.style.transform = `translate3d(${(-x * range).toFixed(2)}px, ${(-y * range).toFixed(2)}px, 0) scale(var(--fx-zoom, 1.08))`;
    };
    const open = (row, e) => {
      const p = parts(row);
      if (!p) return;
      clearTimeout(timers.get(p.thumb));
      const dir = side(row, e);
      p.thumb.dataset.state = "action";
      p.thumb.style.zIndex = String(++layer);
      p.clip.style.transition = "none";
      p.clip.style.clipPath = reduce ? "inset(0 0 0 0)" : HIDE[dir];
      void p.clip.offsetWidth;
      p.clip.style.transition = `clip-path ${dur}s ${ease}`;
      p.clip.style.clipPath = "inset(0 0 0 0)";
      shift(row, p, e);
    };
    const close = (row, e) => {
      const p = parts(row);
      if (!p) return;
      // Moving to another row of the same list keeps this photo and stacks the new photo on top
      const to = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('[data-fx-part="row"]');
      if (to && to !== row && el.contains(to) && parts(to)) {
        timers.set(p.thumb, setTimeout(() => { p.thumb.dataset.state = "standby"; }, dur * 1000 + rest));
        return;
      }
      el.querySelectorAll('[data-fx-part="thumb"][data-state="action"]').forEach((t) => {
        if (t === p.thumb) return;
        clearTimeout(timers.get(t));
        t.dataset.state = "standby";
      });
      p.clip.style.transition = `clip-path ${dur}s ${ease}`;
      p.clip.style.clipPath = HIDE[side(row, e)];
      timers.set(p.thumb, setTimeout(() => {
        p.thumb.dataset.state = "standby";
        if (p.media) p.media.style.transform = "";
      }, rest));
    };
    rows.forEach((row) => {
      const p = parts(row);
      if (p) p.thumb.dataset.state = "standby";
      const on = (e) => open(row, e);
      const off = (e) => close(row, e);
      const move = (e) => { const q = parts(row); if (q) shift(row, q, e); };
      row.addEventListener("mouseenter", on);
      row.addEventListener("mouseleave", off);
      row.addEventListener("mousemove", move);
      offs.push(() => { row.removeEventListener("mouseenter", on); row.removeEventListener("mouseleave", off); row.removeEventListener("mousemove", move); });
    });
    return () => {
      offs.forEach((f) => f());
      timers.forEach(clearTimeout);
      rows.forEach((row) => {
        const p = parts(row);
        if (!p) return;
        delete p.thumb.dataset.state;
        p.thumb.style.zIndex = "";
        p.clip.style.transition = "";
        p.clip.style.clipPath = "";
        if (p.media) p.media.style.transform = "";
      });
    };
  });
})();
