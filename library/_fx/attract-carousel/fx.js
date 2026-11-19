(() => {
  // A rebuild of the original Flickity feel — each frame adds (target − position) × attraction to the velocity and multiplies by (1 − friction), so it glides into place.
  // Dragging follows the hand (only half past the ends). On release it travels at that speed and snaps to the slot nearest to where it would stop. Buttons move one slot (or one page) at a time
  kfFx.register("attract-carousel", (el, { options, reduce }) => {
    const view = el.querySelector('[data-fx-part="viewport"]') || el;
    const track = el.querySelector('[data-fx-part="track"]');
    if (!track || !track.children.length) return;
    const prev = el.querySelector('[data-fx-part="prev"]'), next = el.querySelector('[data-fx-part="next"]');
    const attraction = +(options.attraction ?? 0.025), friction = +(options.friction ?? 0.28);
    const threshold = +(options.threshold ?? 3), fit = options.group === "fit";
    const rewind = !!+(options.rewind ?? 0);
    const wrap = !!+(options.wrap ?? 0);
    let x = 0, v = 0, target = 0, index = 0, slides = [], raf = 0, last = 0;
    let drag = null;
    const measure = (snap = true) => {
      const cells = [...track.children];
      const max = Math.max(0, track.scrollWidth - view.clientWidth);
      const lefts = cells.map((c) => c.offsetLeft - cells[0].offsetLeft);
      let s = [];
      if (fit) {
        // Group the cells that fit in one panel (groupCells: true)
        let start = 0;
        lefts.forEach((l, i) => { if (i === 0 || l + cells[i].offsetWidth - start > view.clientWidth + 1) { s.push(l); start = l; } });
      } else s = lefts;
      // contain — end cells gather at the last panel’s spot
      slides = [...new Set(s.map((l) => Math.min(l, max)))];
      index = Math.min(index, slides.length - 1);
      target = -slides[index];
      if (!raf && snap) { x = target; paint(); }
      buttons();
    };
    const paint = () => { track.style.transform = `translate3d(${x}px,0,0)`; };
    const buttons = () => {
      if (prev) prev.disabled = !rewind && !wrap && index <= 0;
      if (next) next.disabled = !rewind && !wrap && index >= slides.length - 1;
    };
    const tick = (now) => {
      // The original counts in units of one 60fps frame — if a frame is late, it runs that many times
      const steps = Math.min(4, Math.max(1, Math.round((now - (last || now - 16.7)) / 16.7)));
      last = now;
      for (let k = 0; k < steps; k++) {
        if (!drag) v += (target - x) * attraction;
        x += v;
        v *= 1 - friction;
      }
      paint();
      if (!drag && Math.abs(v) < 0.01 && Math.abs(target - x) < 0.5) { x = target; paint(); raf = 0; last = 0; return; }
      raf = requestAnimationFrame(tick);
    };
    const go = () => { if (reduce) { x = target; paint(); return; } if (!raf) raf = requestAnimationFrame(tick); };
    const select = (i) => { index = Math.max(0, Math.min(slides.length - 1, i)); target = -slides[index]; buttons(); go(); el.dispatchEvent(new CustomEvent("fx:select", { detail: { index } })); };
    const last1 = () => slides.length - 1;
    // wrap: move the cells of the opposite-end panel over to this side and shift the position back by the same amount so what is visible stays unchanged, moving only one panel
    const cellsFrom = (fromLeft) => {
      const cells = [...track.children], base = cells[0].offsetLeft;
      const edge = fromLeft ? slides[1] ?? Infinity : slides[slides.length - 1];
      return cells.filter((c) => (fromLeft ? c.offsetLeft - base < edge : c.offsetLeft - base >= edge));
    };
    const shift = (moved, front) => {
      const w = moved.reduce((sum, c) => sum + c.offsetWidth + parseFloat(getComputedStyle(c).marginRight || 0), 0);
      if (front) moved.slice().reverse().forEach((c) => track.prepend(c)); else moved.forEach((c) => track.append(c));
      x += front ? -w : w; paint();
      measure(false);
    };
    const onPrev = () => {
      if (wrap && index <= 0) { shift(cellsFrom(false), true); select(0); return; }
      select(rewind && index <= 0 ? last1() : index - 1);
    };
    const onNext = () => {
      if (wrap && index >= last1()) { shift(cellsFrom(true), false); select(last1()); return; }
      select(rewind && index >= last1() ? 0 : index + 1);
    };
    // fx:goto(detail.index) — for picking a slot from outside, like a number button
    const onGoto = (e) => select(Number(e.detail && e.detail.index) || 0);
    el.addEventListener("fx:goto", onGoto);
    prev && prev.addEventListener("click", onPrev);
    next && next.addEventListener("click", onNext);
    const lo = () => -slides[slides.length - 1];
    const down = (e) => {
      if (e.button > 0) return;
      drag = { x0: e.clientX, y0: e.clientY, start: x, live: false, px: x, pt: performance.now(), id: e.pointerId };
    };
    const move = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
      if (!drag.live) {
        if (Math.abs(dx) < threshold) return;
        // If it moved more vertically, hand off to page scroll
        if (Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
        drag.live = true;
        view.setPointerCapture && view.setPointerCapture(e.pointerId);
        el.classList.add("is-fx-dragging");
      }
      let nx = drag.start + dx;
      if (nx > 0) nx *= 0.5;
      else if (nx < lo()) nx = (nx - lo()) * 0.5 + lo();
      const now = performance.now();
      // Speed is per one frame (16.7ms)
      v = ((nx - drag.px) / Math.max(1, now - drag.pt)) * 16.7;
      drag.px = nx; drag.pt = now;
      x = nx; paint();
      if (!raf && !reduce) { raf = requestAnimationFrame(tick); }
    };
    const up = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const was = drag; drag = null;
      el.classList.remove("is-fx-dragging");
      if (!was.live) return;
      // End point to glide to at release speed — geometric sum v·(1−f)/f
      const rest = x + (v * (1 - friction)) / friction;
      let best = 0;
      slides.forEach((s, i) => { if (Math.abs(-s - rest) < Math.abs(-slides[best] - rest)) best = i; });
      // If it lands on the same cell, nudge it one cell toward the dragged side (original dragEndBoostSelect)
      if (best === index && Math.abs(x - was.start) > view.clientWidth * 0.1) best += x < was.start ? 1 : -1;
      select(best);
    };
    const click = (e) => { if (el.classList.contains("is-fx-dragged")) { e.preventDefault(); e.stopPropagation(); } };
    const markDragged = () => { el.classList.add("is-fx-dragged"); setTimeout(() => el.classList.remove("is-fx-dragged"), 0); };
    const upWrap = (e) => { const live = drag && drag.live; up(e); if (live) markDragged(); };
    view.addEventListener("pointerdown", down);
    addEventListener("pointermove", move);
    addEventListener("pointerup", upWrap);
    addEventListener("pointercancel", upWrap);
    view.addEventListener("click", click, true);
    const ro = new ResizeObserver(measure);
    ro.observe(view); [...track.children].forEach((c) => ro.observe(c));
    measure();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("fx:goto", onGoto);
      prev && prev.removeEventListener("click", onPrev);
      next && next.removeEventListener("click", onNext);
      view.removeEventListener("pointerdown", down);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", upWrap);
      removeEventListener("pointercancel", upWrap);
      view.removeEventListener("click", click, true);
      track.style.transform = "";
    };
  });
})();
