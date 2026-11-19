// When the pointer enters the panel, a round button grows into view and follows the cursor by a lerp fraction of the remaining distance each frame (a CSS transition delays it once more)
(() => {
  kfFx.register("lerp-stalker", (el, { options, reduce, hover }) => {
    const st = el.querySelector('[data-fx-part="stalker"]');
    if (!st) return;
    if (!hover) { st.hidden = true; return () => { st.hidden = false; }; }
    const k = +(options.lerp ?? 0.2);
    let mx = 0, my = 0, x = 0, y = 0, raf = 0, seen = false;
    const ac = new AbortController();
    const show = () => el.classList.add("is-show");
    const hide = () => el.classList.remove("is-show");
    addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true, signal: ac.signal });
    el.addEventListener("pointerenter", show, { signal: ac.signal });
    el.addEventListener("pointerleave", hide, { signal: ac.signal });
    const place = () => {
      const r = el.getBoundingClientRect();
      if (reduce) { x = mx - r.left; y = my - r.top; }
      else { x += k * (mx - r.left - x); y += k * (my - r.top - y); }
      st.style.transform = `translate(${x}px, ${y}px)`;
    };
    const tick = () => { place(); raf = seen ? requestAnimationFrame(tick) : 0; };
    // Rests when off-screen and spins again when it re-enters
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen && !raf) raf = requestAnimationFrame(tick); });
    io.observe(el);
    return () => { ac.abort(); io.disconnect(); cancelAnimationFrame(raf); hide(); st.style.removeProperty("transform"); };
  });
})();
