// Vertically stacked cells grow (width, height, opacity) the closer they are to the focus line on screen. Emits fx:focus when the cell closest to the focus changes.
(() => {
  kfFx.register("focus-grow-column", (el, { options, reduce, scroller }) => {
    const items = () => [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items().length) return;
    const focusY = +(options.focus ?? 0.34), min = +(options.min ?? 0.28), falloff = +(options.falloff ?? 0.72) || 0.72, power = +(options.power ?? 1.65) || 1.65;
    const lerp = reduce ? 1 : +(options.lerp ?? 0.16) || 0.16, base = +(options.base || 52) || 52;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const view = () => (scroller ? scroller.getBoundingClientRect() : { top: 0, height: innerHeight });
    const state = new WeakMap();
    let raf = 0, focused = -1;
    const target = (it, v) => {
      const r = it.getBoundingClientRect(), focus = v.top + v.height * focusY, anchor = r.top + r.height * 0.12;
      if (anchor <= focus) return 1;
      const t = clamp(1 - (anchor - focus) / Math.max(1, (v.height - v.height * focusY) * falloff), 0, 1);
      return min + (1 - Math.pow(1 - t, power)) * (1 - min);
    };
    const apply = (it, v, snap) => {
      const to = target(it, v), cur = state.get(it);
      const s = clamp(cur == null || snap ? to : cur + (to - cur) * lerp, min, 1);
      state.set(it, s);
      it.style.width = (s * 100).toFixed(2) + "%";
      it.style.height = base * s + "em";
      it.style.opacity = 0.35 + s * 0.65;
      return Math.abs(to - s);
    };
    const tick = () => {
      raf = 0;
      const list = items(), v = view();
      let moving = 0, best = -1, score = Infinity;
      list.forEach((it, i) => {
        moving = Math.max(moving, apply(it, v, false));
        const r = it.getBoundingClientRect();
        let d = Math.abs(r.top + r.height * 0.12 - (v.top + v.height * focusY));
        if (r.top > v.top + v.height) d += v.height * 0.5;
        if (d < score) { score = d; best = i; }
      });
      if (best !== focused) { focused = best; el.dispatchEvent(new CustomEvent("fx:focus", { bubbles: true, detail: { index: best, item: list[best] } })); }
      if (moving > 0.001) raf = requestAnimationFrame(tick);
    };
    const ask = () => { if (!raf) raf = requestAnimationFrame(tick); };
    // Cell sizes push each other’s places so it won’t settle in one pass — run it a few times to settle
    const settle = () => { const v = view(); for (let pass = 0; pass < 8; pass++) { let d = 0; items().forEach((it) => { d = Math.max(d, apply(it, v, true)); }); if (d < 0.001) break; } ask(); };
    const target0 = scroller || window;
    target0.addEventListener("scroll", ask, { passive: true });
    addEventListener("resize", settle);
    const ro = new ResizeObserver(ask);
    ro.observe(el);
    settle();
    return () => {
      cancelAnimationFrame(raf);
      target0.removeEventListener("scroll", ask);
      removeEventListener("resize", settle);
      ro.disconnect();
      items().forEach((it) => { it.style.width = it.style.height = it.style.opacity = ""; });
    };
  });
})();
