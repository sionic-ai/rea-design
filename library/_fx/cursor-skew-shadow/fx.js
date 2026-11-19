(() => {
  // Right under the title a faint shadow of the same letters lies down on the baseline axis, lying further as the cursor moves toward the right of the screen —
  // skew(clientX / div + base, up to max) · scale(1, flatness). Follows the pointer directly with no delay (original mousemove as is)
  const listeners = new Set();
  let bound = false;
  const onMove = (e) => listeners.forEach((fn) => fn(e.clientX));
  kfFx.register("cursor-skew-shadow", (el, { options, reduce, hover }) => {
    const shadow = el.querySelector('[data-fx-part="shadow"]');
    if (!shadow) return;
    const base = +(options.base ?? 20), div = +(options.div || 20), max = +(options.max ?? 50), flat = +(options.flat ?? 0.6);
    const set = (deg) => { shadow.style.transform = `skew(${deg}deg) scale(1, ${flat})`; };
    if (reduce || !hover) return () => shadow.style.removeProperty("transform");
    const fn = (x) => set(Math.min(x / div + base, max));
    listeners.add(fn);
    if (!bound) { addEventListener("pointermove", onMove, { passive: true }); bound = true; }
    return () => {
      listeners.delete(fn);
      if (!listeners.size && bound) { removeEventListener("pointermove", onMove); bound = false; }
      shadow.style.removeProperty("transform");
    };
  });
})();
