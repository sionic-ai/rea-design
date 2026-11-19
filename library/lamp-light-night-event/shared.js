// Coarse stipple panel — in the original, the dark wall, the light pool and the band fading into dark are pictures whose edges scatter into grains.
// Instead of image files, each cell’s ”probability of dark” is set by a shape formula and random dots are stamped to get the same grain. Dot color is the skin’s base color (--kf-bg), so it follows when the skin changes.
(() => {
  const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

  // u·v are horizontal/vertical ratios within the board (0~1). The returned value is the probability that the cell is dark
  // Horizontal pixels of the original picture — shot at the same resolution regardless of screen size and shown scaled down, so on phones dots get finer and the band smoother
  const RES = { wall: 1380, "wall-end": 1441, pool: 3280, fade: 2880 };
  const SHAPES = {
    // Hero left wall: above the diagonal running from the top-right corner down to bottom-left (92% height) is dark, and the grain band widens toward the bottom (light spreads)
    wall: (u, v) => {
      const edge = 1 - v / 0.92;
      const band = 0.005 + 0.055 * v;
      return clamp(0.5 + (0.5 * (edge - u)) / band);
    },
    // Wall of the final scene: almost entirely dark, only the inner edge tilts slightly from 97.5% → 87.5%
    "wall-end": (u, v) => {
      const edge = 0.975 - 0.1 * v;
      const band = 0.004 + 0.05 * v;
      return clamp(0.5 + (0.5 * (edge - u)) / band);
    },
    // Bottom darkness: only the top center is open as an elliptical pool of light
    pool: (u, v) => {
      const x = (u - 0.5) / 0.47;
      const y = (v + 0.25) / 0.78;
      return smooth(0.9, 1.1, Math.sqrt(x * x + y * y));
    },
    // Paper to dark: empty at the top, fully dark from 85% down
    fade: (u, v) => smooth(0.02, 0.85, v),
  };

  const inkOf = () => {
    const probe = document.createElement("i");
    probe.style.color = "var(--kf-bg)";
    probe.hidden = true;
    document.body.append(probe);
    const m = (getComputedStyle(probe).color.match(/[\d.]+/g) || []).map(Number);
    probe.remove();
    return m;
  };

  const paint = (canvas, ink) => {
    const shape = SHAPES[canvas.dataset.stipple];
    if (!shape) return;
    const r = canvas.getBoundingClientRect();
    // Past three times the screen size, shrinking gives the same gray, so it stops there. For the mirror panel, scale does not change the size.
    const cw = canvas.offsetWidth, ch = canvas.offsetHeight;
    const w = Math.max(1, Math.round(Math.min(RES[canvas.dataset.stipple], cw * 3)));
    const h = Math.max(1, Math.round((w * ch) / Math.max(1, cw)));
    if (!r.width || (canvas.width === w && canvas.height === h && canvas.dataset.done)) return;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    const img = ctx.createImageData(w, h);
    const d = img.data;
    const [cr, cg, cb] = ink;
    for (let y = 0; y < h; y++) {
      const v = (y + 0.5) / h;
      for (let x = 0; x < w; x++) {
        const p = shape((x + 0.5) / w, v);
        // Specks rarely land on the light side too
        if (Math.random() >= (p > 0 ? p : 0.0012)) continue;
        const i = (y * w + x) * 4;
        d[i] = cr; d[i + 1] = cg; d[i + 2] = cb; d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    canvas.dataset.done = "1";
  };

  const start = () => {
    const ink = inkOf();
    const all = [...document.querySelectorAll("canvas[data-stipple]")];
    const ro = new ResizeObserver((list) => list.forEach((e) => paint(e.target, ink)));
    // The hero panel paints right away, the rest one section at a time in idle gaps so the first open isn’t held up
    const later = all.filter((c) => !c.closest(".ny-stage, .ny-hero"));
    all.filter((c) => !later.includes(c)).forEach((c) => { paint(c, ink); ro.observe(c); });
    const next = () => {
      const c = later.shift();
      if (!c) return;
      paint(c, ink);
      ro.observe(c);
      setTimeout(next, 0);
    };
    setTimeout(next, 0);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
