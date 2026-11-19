// Interpolates card size and corners toward the stage size by how far it has entered the stage — paints only once per scroll (batched with rAF).
(() => {
  kfFx.register("card-grow-stage", (el, { options, reduce, scroller }) => {
    const stage = (options.stage && el.closest(options.stage)) || el.parentElement;
    if (!stage) return;
    const track = (options.trigger && (el.closest(options.trigger) || document.querySelector(options.trigger))) || stage.closest("section") || stage;
    const W = +(options.w ?? 996) || 996, ratio = +(options.ratio ?? 560 / 996) || 560 / 996, rad = +(options.radius ?? 15), gap = +(options.gap ?? 120);
    const from = Math.min(0.99, +(options.from ?? 0.6)), narrow = +(options.narrow ?? 480);
    const io3 = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let raf = 0;
    const paint = () => {
      raf = 0;
      const sw = stage.clientWidth, sh = stage.clientHeight;
      const vh = scroller ? scroller.clientHeight : innerHeight;
      let e = 1;
      if (!reduce && innerWidth > narrow) {
        const top = track.getBoundingClientRect().top - (scroller ? scroller.getBoundingClientRect().top : 0);
        const o = Math.min(1, Math.max(0, 1 - top / vh));
        e = io3(Math.min(1, Math.max(0, (o - from) / (1 - from))));
      }
      const n = Math.max(0, Math.min(W, sw - gap)), nh = n * ratio;
      el.style.width = `${n + (sw - n) * e}px`;
      el.style.height = `${nh + (sh - nh) * e}px`;
      el.style.borderRadius = `${rad * (1 - e)}px`;
    };
    const ask = () => { if (!raf) raf = requestAnimationFrame(paint); };
    const target = scroller || window;
    target.addEventListener("scroll", ask, { passive: true });
    addEventListener("resize", ask);
    const ro = new ResizeObserver(ask);
    ro.observe(stage);
    paint();
    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      target.removeEventListener("scroll", ask); removeEventListener("resize", ask);
      el.style.width = el.style.height = el.style.borderRadius = "";
    };
  });
})();
