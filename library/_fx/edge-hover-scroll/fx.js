(() => {
  // Original thumb_slider: adds a speed proportional to depth within the end cell to scrollLeft every rAF. Runs only while the pointer is over the strip.
  kfFx.register("edge-hover-scroll", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const zone = Math.min(0.5, Math.max(0, +(options.zone ?? 0.3)));
    const gain = +(options.gain ?? 0.05), max = +(options.max ?? 6);
    let v = 0, raf = 0, last = 0;
    const tick = (now) => {
      const dt = Math.max(1, now - last); last = now;
      if (v) el.scrollLeft += v * Math.min(3, dt / 16.667);
      raf = requestAnimationFrame(tick);
    };
    const enter = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } };
    const leave = () => { v = 0; cancelAnimationFrame(raf); raf = 0; };
    const move = (e) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect(), a = r.left + zone * r.width, b = r.right - zone * r.width, x = e.clientX;
      v = x < a ? Math.max(-max, gain * (x - a)) : x > b ? Math.min(max, gain * (x - b)) : 0;
      enter();
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => { leave(); el.removeEventListener("pointerenter", enter); el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
  });
})();
