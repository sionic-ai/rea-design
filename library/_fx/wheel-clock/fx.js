(() => {
  /* Instead of scrolling the document, wheel · finger pushes a single value p — a ”one-screen story” where every effect in the panel is a function of p.
     Wheel step px = p 1, each push overwrites the single GSAP tween (glide · ease) heading to p so it slides along following the pointer. Keys (↓ · PageDown / ↑ · PageUp / Home · End) step between stops.
     Panel gets --fx-p, child [data-fx-part=layer] uses the progress --fx-k (0~1) over the data-from~data-to range and fires an fx:clock event (detail.p) every frame. */
  kfFx.register("wheel-clock", (el, { options, reduce }) => {
    const step = +options.step || 700, glide = +(options.glide ?? 0.9), touch = +(options.touch ?? 1.6);
    const max = +options.max || 10, ease = options.ease || "power2.out";
    const stops = String(options.stops || "").split(",").map(Number).filter((n) => !Number.isNaN(n)).sort((a, b) => a - b);
    const S = { p: 0, target: 0 };
    const clamp = (v) => Math.min(max, Math.max(0, v));
    const layers = () => [...el.querySelectorAll('[data-fx-part="layer"]')];
    const paint = () => {
      el.style.setProperty("--fx-p", S.p.toFixed(4));
      layers().forEach((l) => {
        const a = +(l.dataset.from ?? 0), b = +(l.dataset.to ?? max);
        l.style.setProperty("--fx-k", Math.min(1, Math.max(0, (S.p - a) / (b - a || 1))).toFixed(4));
      });
      el.dispatchEvent(new CustomEvent("fx:clock", { detail: { p: S.p } }));
    };
    const to = (v, dur, e) => {
      S.target = clamp(v);
      if (reduce || dur === 0) { gsap.killTweensOf(S); S.p = S.target; paint(); return; }
      gsap.to(S, { p: S.target, duration: dur, ease: e, overwrite: true, onUpdate: paint });
    };
    const onWheel = (e) => {
      if (e.target.closest && e.target.closest("[data-own-wheel]")) return;
      e.preventDefault();
      to(S.target + (e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY) / step, glide, ease);
    };
    let ty = null;
    const onStart = (e) => { ty = e.touches[0].clientY; };
    const onMove = (e) => { if (ty == null) return; const y = e.touches[0].clientY; to(S.target + ((ty - y) * touch) / step, glide, ease); ty = y; };
    const jump = (v) => to(v, Math.min(2.4, Math.max(0.9, Math.abs(v - S.p) * 0.9)), "power3.inOut");
    const onKey = (e) => {
      if (!stops.length || (e.target.closest && e.target.closest("input, textarea"))) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); jump(stops.find((s) => s > S.p + 0.05) ?? max); }
      else if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); jump([...stops].reverse().find((s) => s < S.p - 0.05) ?? 0); }
      else if (e.key === "Home") { e.preventDefault(); jump(0); }
      else if (e.key === "End") { e.preventDefault(); jump(max); }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: true });
    addEventListener("keydown", onKey);
    const onGo = (e) => { if (e.detail && typeof e.detail.p === "number") jump(e.detail.p); };
    el.addEventListener("fx:go", onGo);
    paint();
    return () => {
      gsap.killTweensOf(S);
      el.removeEventListener("wheel", onWheel); el.removeEventListener("touchstart", onStart); el.removeEventListener("touchmove", onMove);
      el.removeEventListener("fx:go", onGo); removeEventListener("keydown", onKey);
      el.style.removeProperty("--fx-p"); layers().forEach((l) => l.style.removeProperty("--fx-k"));
    };
  });
})();
