// Rotating vertical-line indicator — places N lines (default 11) at positions wide in the middle and narrow at both ends like around a cylinder (0·5·15·32·60·100·140·168·188·199·204 stretched to the panel width), and
// Every step (default 800ms) all rows shift one place (left transition = step, ease-in-out). Fades at both end positions, and only the lit line gets the accent color
(() => {
  const STOPS = [0, 5, 15, 32, 60, 100, 140, 168, 188, 199, 204];
  kfFx.register("line-drum-mark", (el, { options, reduce }) => {
    const n = Math.max(2, +(options.lines || 11)), step = +(options.step || 800), lit = +(options.lit ?? 5);
    const wrap = document.createElement("span");
    wrap.className = "fx-line-drum__wrap";
    wrap.setAttribute("aria-hidden", "true");
    wrap.style.setProperty("--fx-step", `${step}ms`);
    const lines = Array.from({ length: n }, (_, i) => {
      const s = document.createElement("span");
      s.className = "fx-line-drum__line" + (i === lit ? " is-lit" : "");
      wrap.append(s);
      return s;
    });
    el.append(wrap);
    // Slots are proportional to the panel width — scaling up the values of the original 204px panel as they are
    const place = (k) => lines.forEach((s, i) => {
      const at = STOPS[(k + i) % STOPS.length];
      s.style.left = `calc(${(at / 204) * 100}% - ${(at / 204)} * var(--fx-w, 8px))`;
      s.style.opacity = at === 0 || at === 204 ? "0.1" : "1";
    });
    place(0);
    if (reduce) return () => wrap.remove();
    let raf = 0, t0 = null, last = -1;
    const tick = (now) => {
      if (t0 === null) t0 = now;
      const k = Math.floor((now - t0) / step) % STOPS.length;
      if (k !== last) { last = k; place(k); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); wrap.remove(); };
  });
})();
