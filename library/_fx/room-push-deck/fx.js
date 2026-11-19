(() => {
  /* Several rooms stacked in the same spot, pushing out the current room while the next slides in from the side (below on narrow screens).
     The wheel accumulates deltaY and advances one slot when it passes the threshold (per) — resets counting after more than 80ms of rest. During lock after advancing, wheel input is discarded (so an inertial wheel does not skip two slots) */
  kfFx.register("room-push-deck", (el, { options, reduce }) => {
    const rooms = [...el.querySelectorAll(':scope > [data-fx-part="room"], :scope > * > [data-fx-part="room"]')];
    if (rooms.length < 2) return;
    const dots = [...el.querySelectorAll('[data-fx-part="dot"]')];
    const dur = reduce ? 0 : +(options.dur ?? 0.65);
    const ease = kfFx.ease(options.ease || "0.4,0,0.2,1", "power2.inOut");
    const per = +options.per || 80;
    const lockMs = +(options.lock ?? 0.3) * 1000;
    const swipe = +options.swipe || 50;
    const narrowAt = +(options.narrow ?? 810);
    let current = Math.min(rooms.length - 1, Math.max(0, +(options.start ?? 0))), busy = false, cooling = false, acc = 0, last = 0, t0 = 0, coolTimer = 0;

    const narrow = () => innerWidth <= narrowAt;
    const axis = () => (narrow() ? "y" : "x");
    const span = () => (narrow() ? el.clientHeight : el.clientWidth);
    const place = () => {
      if (busy) return;
      const a = axis(), o = a === "x" ? "y" : "x", w = span();
      rooms.forEach((r, i) => gsap.set(r, { [a]: i === current ? 0 : i < current ? -w : w, [o]: 0 }));
    };
    const mark = (i) => dots.forEach((d, k) => d.setAttribute("aria-current", k === i ? "true" : "false"));
    const emit = (type, detail) => el.dispatchEvent(new CustomEvent(type, { bubbles: true, detail }));

    function go(next, dir) {
      if (busy || next === current || next < 0 || next >= rooms.length) return;
      busy = true;
      const a = axis(), d = dir || Math.sign(next - current) || 1, w = span(), from = current;
      rooms.forEach((r, k) => { if (k !== from && k !== next) gsap.set(r, { [a]: k < next ? -w : w }); });
      gsap.set(rooms[next], { [a]: d * w });
      mark(next);
      emit("fx:leave", { index: from, count: rooms.length });
      gsap.to(rooms[from], { [a]: -d * w, duration: dur, ease });
      gsap.to(rooms[next], { [a]: 0, duration: dur, ease, onComplete: () => {
        current = next; busy = false; acc = 0; cooling = true;
        clearTimeout(coolTimer);
        coolTimer = setTimeout(() => { cooling = false; }, lockMs);
        emit("fx:change", { index: next, count: rooms.length });
      } });
    }

    const onWheel = (e) => {
      if (e.fxHandled) return;
      e.preventDefault();
      if (busy || cooling) { acc = 0; return; }
      const now = Date.now();
      if (now - last > 80) acc = 0;
      last = now;
      acc += e.deltaY;
      if (Math.abs(acc) < per) return;
      const d = Math.sign(acc);
      acc = 0;
      go(current + d, d);
    };
    const inside = () => el.matches(":hover") || el.contains(document.activeElement);
    const onKey = (e) => {
      if (!inside() || e.target.closest("input, textarea, [contenteditable]")) return;
      if (["PageDown", "ArrowDown", "ArrowRight"].includes(e.key)) go(current + 1, 1);
      if (["PageUp", "ArrowUp", "ArrowLeft"].includes(e.key)) go(current - 1, -1);
    };
    const onStart = (e) => { t0 = narrow() ? e.touches[0].clientY : e.touches[0].clientX; };
    const onEnd = (e) => {
      const t = narrow() ? e.changedTouches[0].clientY : e.changedTouches[0].clientX, d = t0 - t;
      if (Math.abs(d) > swipe) go(current + Math.sign(d), Math.sign(d));
    };
    const onDot = (e) => {
      const i = dots.indexOf(e.currentTarget);
      e.preventDefault();
      go(i, Math.sign(i - current) || 1);
    };
    const onGo = (e) => { const i = +(e.detail && e.detail.index); if (!isNaN(i)) go(i); };

    el.addEventListener("wheel", onWheel, { passive: false });
    addEventListener("keydown", onKey);
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd);
    dots.forEach((d) => d.addEventListener("click", onDot));
    el.addEventListener("fx:go", onGo);
    const ro = new ResizeObserver(place);
    ro.observe(el);
    place();
    mark(current);

    return () => {
      el.removeEventListener("wheel", onWheel);
      removeEventListener("keydown", onKey);
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
      dots.forEach((d) => d.removeEventListener("click", onDot));
      el.removeEventListener("fx:go", onGo);
      ro.disconnect();
      clearTimeout(coolTimer);
      gsap.killTweensOf(rooms);
      gsap.set(rooms, { clearProps: "transform" });
    };
  });
})();
