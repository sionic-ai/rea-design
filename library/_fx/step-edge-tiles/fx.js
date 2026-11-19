// Lays a 4-row cell strip outside the section head (or tail) and, as the section passes through the screen, turns cells on one by one so the next section’s color crumbles down like stairs.
// Cell order = (line weight × .38 + random × .72) / 1.1 — lines farther from the section are later. With a vertical baseline, the column row is cut to align with that line.
(() => {
  const hash = (n) => { const t = Math.sin(n * 127.1 + 311.7) * 43758.5453; return t - Math.floor(t); };
  kfFx.register("step-edge-tiles", (el, { options, reduce, scroller }) => {
    const edge = options.edge === "bottom" ? "bottom" : "top";
    const rows = parseInt(options.rows, 10) || 4;
    const big = parseFloat(options.cell) || 28, small = parseFloat(options["cell-sm"]) || 17;
    const narrowAt = parseFloat(options.narrow) || 700;
    const guides = options.guides || "";
    const keepSel = options.keep || "[data-rule-keep]";
    const seed = parseFloat(options.seed ?? 0) || 0;
    const tail = +(options.tail ?? 0.8);
    const view = scroller || window;
    let tiles = [], marks = [], on = [], raf = 0;

    const build = () => {
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      const cell = innerWidth < narrowAt ? small : big;
      const lines = guides ? [...document.querySelectorAll(guides)].map((g) => ({ b: g.getBoundingClientRect(), keep: g.matches(keepSel) }))
        .filter(({ b }) => b.width > 0).map(({ b, keep }) => ({ x: b.left + b.width / 2 - r.left, keep }))
        .filter(({ x }) => x > cell / 2 && x < r.width - cell / 2).sort((a, b) => a.x - b.x) : [];
      const stops = [0, ...lines.map((l) => l.x), r.width];
      const widths = [], ruleCols = new Set();
      for (let i = 1; i < stops.length; i++) {
        const seg = stops[i] - stops[i - 1], n = Math.max(1, Math.round(seg / cell));
        if (i > 1 && !lines[i - 2].keep) ruleCols.add(widths.length);
        for (let k = 0; k < n; k++) widths.push(seg / n);
      }
      const cols = widths.length;
      el.textContent = "";
      el.style.gridTemplateColumns = widths.map((w) => `${w}fr`).join(" ");
      el.style.gridAutoRows = `${r.width / cols}px`;
      tiles = []; marks = [];
      const showRules = options.rules === "on";
      for (let row = 0; row < rows; row++) {
        const weight = edge === "top" ? (rows - 1 - row) / (rows - 1 || 1) : row / (rows - 1 || 1);
        for (let c = 0; c < cols; c++) {
          const t = document.createElement("i");
          t.className = showRules && ruleCols.has(c) ? "fx-set__t is-rule" : "fx-set__t";
          el.appendChild(t);
          tiles.push(t);
          marks.push(0.02 + 0.98 * ((weight * 0.38 + hash(seed * 31 + row * 997 + c) * 0.72) / 1.1));
        }
      }
      on = tiles.map(() => false);
    };

    const apply = (p) => {
      for (let i = 0; i < tiles.length; i++) {
        const v = p >= marks[i];
        if (v !== on[i]) { on[i] = v; tiles[i].classList.toggle("is-on", v); }
      }
    };
    const clamp = (v) => (v <= 0 ? 0 : v >= 1 ? 1 : v);
    const progress = () => {
      const r = el.getBoundingClientRect();
      const vh = scroller ? scroller.clientHeight : innerHeight;
      if (edge === "bottom") {
        const top = scroller ? scroller.scrollTop : scrollY;
        const max = scroller ? scroller.scrollHeight - vh : document.documentElement.scrollHeight - vh;
        const start = r.top + top - vh, span = (max - start) * tail;
        return 1 - clamp(span <= 0 ? 0 : (top - start) / span);
      }
      const span = vh - r.height;
      return clamp(span <= 0 ? 0 : (vh - r.bottom) / span);
    };
    const tick = () => { raf = 0; apply(progress()); };
    const ask = () => { raf ||= requestAnimationFrame(tick); };

    build();
    if (reduce) { apply(edge === "top" ? 1 : 0); return () => { el.textContent = ""; }; }
    let lastW = innerWidth;
    const resize = () => { if (innerWidth !== lastW) { lastW = innerWidth; build(); } ask(); };
    const ro = new ResizeObserver(() => { if (!tiles.length) build(); ask(); });
    ro.observe(el);
    view.addEventListener("scroll", ask, { passive: true });
    addEventListener("resize", resize);
    tick();
    return () => {
      view.removeEventListener("scroll", ask);
      removeEventListener("resize", resize);
      ro.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = "";
    };
  });
})();
