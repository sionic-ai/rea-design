(() => {
  // A full-screen photo panel shrinks into a rounded frame at the spot of another element (blank cell between title words) — fits clip-path inset to the target box, with the inner photo at .8×.
  kfFx.register("frame-shrink-intro", (el, { options, reduce }) => {
    const sel = options.target;
    const target = sel ? document.querySelector(sel) : null;
    if (!target) return;
    const img = el.querySelector('[data-fx-part="image"]');
    const dur = +(options.dur ?? 1.3), delay = +(options.delay ?? 0);
    const measure = () => {
      const r = target.getBoundingClientRect(), b = el.getBoundingClientRect();
      el.style.setProperty("--fx-inset", `${r.top - b.top}px ${b.right - r.right}px ${b.bottom - r.bottom}px ${r.left - b.left}px`);
    };
    el.style.setProperty("--fx-dur", `${reduce ? 0 : dur}s`);
    el.style.setProperty("--fx-radius", `${+(options.radius ?? 18)}px`);
    el.style.setProperty("--fx-scale", String(+(options.scale ?? 0.8)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(target); ro.observe(el);
    addEventListener("resize", measure);
    const go = () => { measure(); el.classList.add("fx-shrunk"); };
    const done = (e) => { if (e.target === el && e.propertyName === "clip-path") el.dispatchEvent(new CustomEvent("fx:shrunk", { bubbles: true })); };
    el.addEventListener("transitionend", done);
    const t = options.start === "wait" ? null : setTimeout(go, (reduce ? 0 : delay) * 1000);
    el.addEventListener("fx:play", go);
    return () => { clearTimeout(t); ro.disconnect(); removeEventListener("resize", measure); el.removeEventListener("fx:play", go); el.removeEventListener("transitionend", done); el.classList.remove("fx-shrunk"); if (img) img.style.transform = ""; };
  });
})();
