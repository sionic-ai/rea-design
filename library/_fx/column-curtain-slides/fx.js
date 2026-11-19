// Photos are stacked over several vertical columns, and each column peels upward in the same order to reveal the next picture — columns lag each other by lag seconds so the curtain passes like a wave.
// Ports the original CSS keyframes (slideMask · slideMove · slideFade, each slide delayed by each seconds) to Web Animations, exposing slide count and length as options
(() => {
  const SHAPES = {
    up: ["polygon(0 100%, 100% 100%, 100% 0, 0 0)", "polygon(0 0, 100% 0, 100% 0, 0 0)"],
    left: ["polygon(100% 0, 0 0, 0 100%, 100% 100%)", "polygon(0 0, 0 0, 0 100%, 0% 100%)"],
  };
  kfFx.register("column-curtain-slides", (el, { options, reduce }) => {
    const cols = [...el.querySelectorAll(':scope > [data-fx-part="column"]')];
    if (!cols.length) return;
    const each = +(options.each ?? 5) || 5;
    const lag = +(options.lag ?? 0.15);
    const shift = String(options.shift ?? "-15%");
    const mq = matchMedia(`(max-width: ${+(options["narrow-at"] ?? 767)}px)`);
    let anims = [];
    const stop = () => { anims.forEach((a) => a.cancel()); anims = []; };
    const start = () => {
      stop();
      const dir = SHAPES[(mq.matches ? options.narrow : options.dir) || (mq.matches ? "left" : "up")] || SHAPES.up;
      cols.forEach((col, c) => {
        const slides = [...col.querySelectorAll(':scope > [data-fx-part="slide"]')];
        const n = slides.length;
        slides.forEach((s, i) => { s.style.zIndex = String(n - i); });
        if (reduce || n < 2) return;
        // The original has 6 sections at 5s each (30s per loop) with 17%·18%·24%·32%·79%·80% — shifted in proportion to section length
        const T = n * each;
        const a = Math.min(0.9, (1.02 * each) / T), fs = Math.min(0.91, (1.08 * each) / T), b = Math.min(0.92, (1.44 * each) / T), z = Math.min(0.94, (1.92 * each) / T);
        const r1 = Math.max(z + 0.01, 1 - (1.26 * each) / T), r2 = Math.max(r1 + 0.005, 1 - (1.2 * each) / T);
        // The original applies cell delay only to the section (mask) and photo (fade), while the inner shift (move) follows only the section’s order
        const timing = (i, lagged = true) => ({ duration: T * 1000, delay: (i * each + (lagged ? c * lag : 0)) * 1000, iterations: Infinity });
        slides.forEach((s, i) => {
          const inner = s.querySelector('[data-fx-part="inner"]') || s.firstElementChild;
          const img = inner?.querySelector('[data-fx-part="image"]') || inner?.firstElementChild;
          anims.push(s.animate([
            { offset: 0, clipPath: dir[0], easing: "ease" },
            { offset: a, clipPath: dir[0], zIndex: n + 1, easing: "ease" },
            { offset: b, clipPath: dir[1], zIndex: n + 1, easing: "ease" },
            { offset: z, zIndex: 0, easing: "ease" },
            { offset: 1, clipPath: dir[1] },
          ], timing(i)));
          if (inner) anims.push(inner.animate([
            { offset: 0, transform: "translateX(0%)" },
            { offset: b, transform: `translateX(${shift})` },
            { offset: r1, transform: `translateX(${shift})` },
            { offset: r2, transform: "translateX(-2%)" },
            { offset: 1, transform: "translateX(0%)" },
          ], { ...timing(i, false), easing: "linear" }));
          if (img && img !== inner) anims.push(img.animate([
            { offset: 0, opacity: 1, easing: "ease" },
            { offset: fs, opacity: 1, easing: "ease" },
            { offset: b, opacity: 0, easing: "ease" },
            { offset: r1, opacity: 0, easing: "ease" },
            { offset: r2, opacity: 1, easing: "ease" },
            { offset: 1, opacity: 1 },
          ], timing(i)));
        });
      });
    };
    start();
    mq.addEventListener("change", start);
    return () => { mq.removeEventListener("change", start); stop(); cols.forEach((col) => col.querySelectorAll('[data-fx-part="slide"]').forEach((s) => { s.style.zIndex = ""; })); };
  });
})();
