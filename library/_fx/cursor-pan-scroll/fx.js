(() => {
  // Original space_photos_thumb: put mouse x ratio × overflow width straight into scrollLeft
  kfFx.register("cursor-pan-scroll", (el, { options, reduce, hover }) => {
    if (!hover) return;
    const ease = reduce ? 0 : +(options.ease ?? 0);
    let raf = 0, goal = 0, last = 0;
    const glide = (now) => {
      const dt = Math.max(1, now - last); last = now;
      const k = 1 - Math.exp(-dt / (ease * 250));
      el.scrollLeft += (goal - el.scrollLeft) * k;
      raf = Math.abs(goal - el.scrollLeft) > 0.5 ? requestAnimationFrame(glide) : 0;
    };
    const move = (e) => {
      const r = el.getBoundingClientRect(), max = el.scrollWidth - r.width;
      if (max <= 0 || !r.width) return;
      goal = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * max;
      if (!ease) { el.scrollLeft = goal; return; }
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(glide); }
    };
    el.addEventListener("mousemove", move);
    return () => { cancelAnimationFrame(raf); el.removeEventListener("mousemove", move); };
  });
})();
