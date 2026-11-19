// Each cell gets a threshold v (distance from center + random), and only cells with a threshold greater than progress t are painted — as t goes 0→1 it clears from the center out
(() => {
  kfFx.register("cell-iris-veil", (root, { options, reduce }) => {
    const size = +(options.cell || 20), reveal = reduce ? 0 : +(options.reveal ?? 0.9), cover = reduce ? 0 : +(options.cover ?? 0.55), jit = Math.min(1, Math.max(0, +(options.jitter ?? 0.25)));
    // cols — cell size is screen width ÷ number of cells (Brand 24-cell grid). each — the each of the GSAP grid stagger (delay per 1 cell of distance), when given, the length = Farthest cell distance × each replaces reveal·cover
    // order: shuffle — GSAP stagger { grid, from: "random" } such as distances in cells from the top-left corner, mixed and handed out to each cell
    const cols = +(options.cols || 0), each = options.each != null ? +options.each : null, delay = reduce ? 0 : +(options.delay ?? 0), shuffle = options.order === "shuffle";
    const curve = String(options.ease || "power1.inOut"), ease = /[a-z]/i.test(curve) ? curve : kfFx.ease(curve, "power1.inOut");
    const cv = document.createElement("canvas");
    cv.className = "fx-cells";
    cv.setAttribute("aria-hidden", "true");
    root.append(cv);
    const g = cv.getContext("2d");
    let cells = [], t = 1, sz = size, far = 1;
    const layout = () => {
      cv.width = innerWidth; cv.height = innerHeight;
      sz = cols ? innerWidth / cols : size;
      const nx = cols || Math.ceil(innerWidth / size), ny = Math.ceil(innerHeight / sz);
      cells = [];
      for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
        const d = Math.max(Math.abs((x + 0.5) / nx - 0.5), Math.abs((y + 0.5) / ny - 0.5)) * 2;
        cells.push({ x: x * sz, y: y * sz, v: d * (1 - jit) + Math.random() * jit });
      }
      far = Math.max(nx, ny) / 2;
      if (shuffle) {
        const ds = cells.map((c, i) => Math.hypot(i % nx, Math.floor(i / nx)));
        far = Math.max(...ds) || 1;
        for (let i = ds.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ds[i], ds[j]] = [ds[j], ds[i]]; }
        cells.forEach((c, i) => { c.v = ds[i] / far; });
      }
      draw(t);
    };
    const lenOf = (base) => (reduce ? 0 : each != null ? far * each : base);
    const draw = (p) => {
      t = p;
      g.clearRect(0, 0, cv.width, cv.height);
      if (p >= 1) return;
      g.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--kf-bg").trim() || "black";
      for (const c of cells) if (c.v >= p) g.fillRect(c.x, c.y, Math.ceil(sz), Math.ceil(sz));
    };
    const s = { t: 1 };
    let tw = null;
    const run = (to, dur, done, wait = 0) => (tw?.kill(), (tw = gsap.to(s, { t: to, duration: dur, delay: wait, ease, onUpdate: () => draw(s.t), onComplete: done })));
    const ac = new AbortController(), on = { signal: ac.signal };
    addEventListener("resize", layout, on);
    // If attached at first open it starts covered and then lifts. An element added after everything has opened has nothing to lift
    if (document.readyState === "complete") (s.t = 1), layout();
    else (s.t = 0), (t = 0), layout(), run(1, lenOf(reveal), null, delay);
    addEventListener("pageshow", (e) => e.persisted && (tw?.kill(), (s.t = 1), draw(1)), on);
    root.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || a.origin !== location.origin || a.href === location.href) return;
      e.preventDefault();
      run(0, lenOf(cover), () => (location.href = a.href));
    }, on);
    return () => { ac.abort(); tw?.kill(); cv.remove(); };
  });
})();
