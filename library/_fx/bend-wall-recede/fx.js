(() => {
  // The photo wall flows sideways, then wraps into a cylinder on scroll and recedes — cells (screen width/piece count × screen height/row count) lined up cols at a time move left at 26px per second
  // Spins endlessly, bending c during section progress 8%~63% = Wrapped on a cylinder of radius screen width × .75 by ((p − .08)/.55)² (angle x·c/R per cell) and recedes to .7x
  const GRID = [{ min: 1280, pitch: 6, cols: 8, rows: 3 }, { min: 1024, pitch: 5, cols: 8, rows: 3 }, { min: 640, pitch: 4, cols: 6, rows: 4 }, { min: 0, pitch: 3, cols: 4, rows: 6 }];
  kfFx.register("bend-wall-recede", (el, { options, reduce, scroller }) => {
    const stage = el.querySelector('[data-fx-part="stage"]') || el;
    const tiles = [...stage.querySelectorAll('[data-fx-part="tile"]')].map((t, i) => ({ el: t, i }));
    if (!tiles.length || !window.gsap) return;
    const speed = reduce ? 0 : +(options.speed ?? 26), from = +(options.from ?? 0.08), span = +(options.span ?? 0.55), back = +(options.back ?? 0.3), rr = +(options.radius ?? 0.75);
    let cols = 8, tw = 0, th = 0, run = 0, R = 1, bend = 0, raf = 0, W = 1, H = 1;
    const layout = () => {
      W = el.clientWidth || innerWidth; H = el.clientHeight || innerHeight;
      const g = GRID.find((x) => W >= x.min) || GRID[GRID.length - 1];
      cols = g.cols; tw = W / g.pitch; th = H / g.rows; run = tw * g.cols; R = W * rr;
      tiles.forEach((t) => { t.el.style.width = `${tw - 2}px`; t.el.style.height = `${th - 2}px`; t.el.style.display = t.i < g.cols * g.rows ? "" : "none"; });
    };
    layout();
    const ro = new ResizeObserver(layout); ro.observe(el);
    const st = window.ScrollTrigger ? ScrollTrigger.create({ trigger: el.closest("[data-fx-part=track]") || el.parentElement || el, scroller, start: "top top", end: "bottom bottom", onUpdate: (s) => { const o = Math.min(1, Math.max(0, (s.progress - from) / span)); bend = reduce ? 0 : o * o; } }) : null;
    const t0 = performance.now();
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const s = (performance.now() - t0) / 1000, k = bend / R, sc = 1 - back * bend;
      for (const t of tiles) {
        const cx = t.i % cols, cy = (t.i / cols) | 0;
        const x = ((((cx + 0.5) * tw - s * speed) % run) + run) % run - run / 2, y = (cy + 0.5) * th - H / 2;
        let px = x, pz = 0, a = 0;
        if (k > 1e-6) { a = x * k; px = Math.sin(a) / k; pz = (1 - Math.cos(a)) / k; }
        t.el.style.transform = `translate3d(${px.toFixed(2)}px, ${y.toFixed(2)}px, ${pz.toFixed(2)}px) rotateY(${(-a).toFixed(4)}rad) scale(${sc.toFixed(4)}) translate(-50%, -50%)`;
      }
    };
    frame();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); st?.kill(); tiles.forEach((t) => { t.el.style.transform = ""; t.el.style.width = ""; t.el.style.height = ""; t.el.style.display = ""; }); };
  });
})();
