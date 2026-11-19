// Ending scene where the light cone closes and the lights go out — the dark walls on both sides close from ±angle° to 0° around the inner top corner, and after the dark curtain deepens,
// The last line focuses in from blur. Painted directly from the scroll value with the same formula as the STUDIO scroll animation (cover from% → to% · to% → line-to%).
(() => {
  kfFx.register("cone-shut-scrub", (el, { options, reduce, scroller }) => {
    const walls = [...el.querySelectorAll('[data-fx-part="wall"]')];
    const veil = el.querySelector('[data-fx-part="veil"]');
    const line = el.querySelector('[data-fx-part="line"]');
    if (!walls.length && !veil && !line) return;
    const angle = +(options.angle ?? 32);
    const from = +(options.from ?? 30) / 100;
    const to = +(options.to ?? 45) / 100;
    const lineTo = +(options["line-to"] ?? 50) / 100;
    const blur = +(options.blur ?? 5);

    // First wall pivots at top right, the rest at top left — two walls open like doors at the center vertex
    walls.forEach((w, i) => { w.style.transformOrigin = i === 0 ? "100% 0" : "0 0"; });
    const clamp = (v) => Math.min(1, Math.max(0, v));
    const paint = (c) => {
      const q1 = clamp((c - from) / Math.max(1e-6, to - from));
      const q2 = clamp((c - to) / Math.max(1e-6, lineTo - to));
      walls.forEach((w, i) => { w.style.rotate = `${(i === 0 ? 1 : -1) * angle * (1 - q1)}deg`; });
      if (veil) veil.style.opacity = String(q1);
      if (line) {
        line.style.opacity = String(q2);
        line.style.filter = q2 < 1 && blur ? `blur(${blur * (1 - q2)}px)` : "none";
      }
    };
    const clear = () => {
      walls.forEach((w) => { w.style.rotate = w.style.transformOrigin = ""; });
      if (veil) veil.style.opacity = "";
      if (line) line.style.opacity = line.style.filter = "";
    };
    if (reduce) { paint(1); return clear; }

    const src = scroller || window;
    const read = () => (scroller ? scroller.scrollTop : window.scrollY);
    let top = 0, span = 1, vh = 1;
    const measure = () => {
      const r = el.getBoundingClientRect();
      vh = scroller ? scroller.clientHeight : window.innerHeight;
      top = r.top + (scroller ? scroller.scrollTop - scroller.getBoundingClientRect().top : window.scrollY);
      span = vh + r.height;
    };
    const update = () => paint((read() - top + vh) / span);
    const refresh = () => { measure(); update(); };
    const ro = new ResizeObserver(refresh);
    ro.observe(el);
    ro.observe(document.documentElement);
    src.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", refresh);
    refresh();
    return () => {
      ro.disconnect();
      src.removeEventListener("scroll", update);
      removeEventListener("resize", refresh);
      clear();
    };
  });
})();
