// Follows the cursor every frame by a lerp share of the remaining distance, and stretches and squashes in that direction by the distance moved in one frame (distance × stretch, max squeeze).
// Over links and buttons it shrinks to 0, and if a stick spot is inside, it sticks to its center with damping .3 and ignores the mouse. data-mode="dot" A dot instead of a back loop.
(() => {
  kfFx.register("squeeze-ring-cursor", (el, { options, reduce, hover }) => {
    if (!hover) { el.hidden = true; return () => { el.hidden = false; }; }
    const ring = el.querySelector('[data-fx-part="ring"]');
    const lerp = reduce ? 1 : +(options.lerp ?? 0.1), stickLerp = reduce ? 1 : +(options["stick-lerp"] ?? 0.3);
    const max = reduce ? 0 : +(options.squeeze ?? 0.55), per = +(options.stretch ?? 0.001);
    const targets = options.targets || "a, button", stick = options.stick || "[data-stick]";
    let x = innerWidth / 2, y = innerHeight / 2, dx = x, dy = y, k = lerp, fixed = false, over = false, inside = true, raf = 0;
    const ac = new AbortController(), on = { signal: ac.signal };
    const paint = () => {
      const dot = el.dataset.mode === "dot";
      el.classList.toggle("is-ring", inside && !over && !dot);
      el.classList.toggle("is-dot", inside && !over && dot);
    };
    const mo = new MutationObserver(paint);
    mo.observe(el, { attributes: true, attributeFilter: ["data-mode"] });
    addEventListener("mousemove", (e) => { if (!fixed) { x = e.clientX; y = e.clientY; k = lerp; } }, on);
    document.addEventListener("mouseover", (e) => {
      const t = e.target instanceof Element ? e.target.closest(targets) : null;
      over = !!t;
      const spot = t?.querySelector(stick);
      if (spot && !fixed) {
        const r = spot.getBoundingClientRect();
        x = r.x + r.width * 0.5; y = r.y + r.height * 0.5; k = stickLerp; fixed = true;
        t.addEventListener("mouseleave", (ev) => { fixed = false; x = ev.clientX; y = ev.clientY; k = lerp; }, { once: true, signal: ac.signal });
      }
      paint();
    }, on);
    document.documentElement.addEventListener("mouseleave", () => { inside = false; paint(); }, on);
    document.documentElement.addEventListener("mouseenter", () => { inside = true; paint(); }, on);
    const tick = () => {
      const mx = Math.round(x - dx), my = Math.round(y - dy);
      dx += mx * k;
      dy += my * k;
      const sq = Math.min(Math.hypot(mx, my) * per, max), ang = (Math.atan2(my, mx) * 180) / Math.PI;
      el.style.setProperty("--fx-x", `${dx.toFixed(1)}px`);
      el.style.setProperty("--fx-y", `${dy.toFixed(1)}px`);
      if (ring) ring.style.transform = `rotate(${ang}deg) scale(${1 + sq}, ${1 - sq})`;
      raf = requestAnimationFrame(tick);
    };
    paint();
    raf = requestAnimationFrame(tick);
    return () => {
      ac.abort(); mo.disconnect(); cancelAnimationFrame(raf);
      el.classList.remove("is-ring", "is-dot");
      el.style.removeProperty("--fx-x"); el.style.removeProperty("--fx-y");
      if (ring) ring.style.removeProperty("transform");
    };
  });
})();
