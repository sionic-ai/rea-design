// Pinned vertical focus row: when the section hits the screen top it is pinned for (slide + exit)px, and during the first slide portion the items in the vertical row, one step (step px of scroll) at a time,
// Moves up one slot (gap px) at a time. The farther from center, the smaller (1 − distance × shrink, min .5) and fainter (1 − distance × fade), and only the center one is is-active.
// While the section enters the screen (bottom → top), items rise in sequence from one slot below (.03 later each, max .3) and settle, during the exit share the whole row moves up 60vh and disappears.
(() => {
  kfFx.register("focus-step-column", (el, { options, reduce, scroller }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const row = el.querySelector('[data-fx-part="row"]');
    const step = +(options.step ?? 92) || 92, gap = +(options.gap ?? 118), shrink = +(options.shrink ?? 0.22), fade = +(options.fade ?? 0.42);
    const slide = +(options.slide ?? 900), exit = +(options.exit ?? 1300), T = Math.max(1, slide + exit), m = slide / T, C = (items.length - 1) * step;
    const S = { pos: 0, exit: 0, exitT: 0, enter: reduce ? 1 : 0, enterT: reduce ? 1 : 0 };
    const sts = [];
    if (!reduce) {
      sts.push(ScrollTrigger.create({ trigger: el, scroller, start: "top top", end: `+=${T}`, pin: true, onUpdate: (st) => {
        const p = st.progress;
        S.pos = Math.min(1, p / m) * C;
        S.exitT = exit ? Math.max(0, Math.min(1, (p - m) / (1 - m))) : 0;
        el.dispatchEvent(new CustomEvent("fx:speed", { detail: { velocity: st.getVelocity(), slide: Math.min(1, p / m), exit: S.exitT } }));
      } }));
      sts.push(ScrollTrigger.create({ trigger: el, scroller, start: "top bottom", end: "top top", onUpdate: (st) => (S.enterT = st.progress) }));
    }
    const draw = () => {
      S.exit += (S.exitT - S.exit) * (reduce ? 1 : 0.07);
      S.enter += (S.enterT - S.enter) * (reduce ? 1 : 0.12);
      const e = S.pos / step, E = 0.6;
      items.forEach((c, s) => {
        const R = Math.min(0.3, s * 0.03), q = Math.max(0, Math.min(1, (Math.max(0, (S.enter - E) / (1 - E)) - R) / (1 - R))), v = 1 - Math.pow(1 - q, 3);
        const O = s - e, p = Math.abs(O), sc = Math.max(0.5, 1 - p * shrink);
        c.style.transform = `translateY(calc(-50% + ${(O * gap + (1 - v) * gap).toFixed(1)}px)) scale(${sc.toFixed(3)})`;
        c.style.opacity = (Math.max(0, 1 - p * fade) * v).toFixed(3);
        c.classList.toggle("is-active", p < 0.5);
      });
      if (row) {
        const s2 = Math.min(1, S.exit / 0.35);
        row.style.transform = s2 ? `translateY(${(-s2 * 60).toFixed(1)}vh)` : "";
        row.style.opacity = s2 ? (1 - s2).toFixed(3) : "";
      }
    };
    gsap.ticker.add(draw);
    draw();
    return () => { gsap.ticker.remove(draw); sts.forEach((s) => s.kill(true)); items.forEach((c) => { c.style.transform = c.style.opacity = ""; c.classList.remove("is-active"); }); if (row) row.style.transform = row.style.opacity = ""; };
  });
})();
