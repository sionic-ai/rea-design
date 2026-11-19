(() => {
  const W = 180, H = 120;
  let field = null;
  const fieldOf = () => {
    if (field) return field;
    const hash = (x, y) => { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); };
    const sm = (e) => e * e * (3 - 2 * e);
    const vn = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), u = sm(x - xi), v = sm(y - yi); const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1); const p = a + (b - a) * u; return p + (c + (d - c) * u - p) * v; };
    const fbm = (x, y, o) => { let s = 0, amp = 0.5, f = 1, n = 0; for (let i = 0; i < o; i++) { s += vn(x * f, y * f) * amp; n += amp; amp *= 0.5; f *= 2; } return s / n; };
    const bake = (off, sc, oct) => { const a = new Float32Array(W * H); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) a[y * W + x] = fbm((x / W) * sc * 1.5 + off, (y / H) * sc + off, oct); return a; };
    return (field = { warp: bake(0, 1, 8), density: bake(91, 2, 4) });
  };

  kfFx.register("fog-sweep-hover", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const host = el.querySelector('[data-fx-part="media"]') || el;
    if (getComputedStyle(host).position === "static") host.style.position = "relative";
    const cv = document.createElement("canvas");
    cv.className = "fx-fog-canvas";
    cv.width = W; cv.height = H;
    host.append(cv);
    const g = cv.getContext("2d");
    const dur = Math.max(0.05, +(options.dur ?? 1.7)) * 1000, base = +(options.base ?? 0.54), range = +(options.range ?? 0.45);
    const half = 1, warpK = 1, mid = half + warpK / 2;
    let raf = 0, start = 0, img = null;
    const tint = () => {
      const p = document.createElement("i"); p.style.cssText = "display:none;color:var(--fx-fog-color)"; el.append(p);
      const [r, gg, b] = (getComputedStyle(p).color.match(/[\d.]+/g) || [0, 0, 0]).map(Number); p.remove();
      img = g.createImageData(W, H);
      for (let i = 0; i < W * H; i++) { img.data[i * 4] = r; img.data[i * 4 + 1] = gg; img.data[i * 4 + 2] = b; }
    };
    const frame = (now) => {
      const p = (now - start) / dur;
      if (p >= 1) { g.clearRect(0, 0, W, H); raf = 0; return; }
      const { warp, density } = fieldOf(), d = img.data;
      const e = 1 - (1 - p) * (1 - p), c = -mid + e * (1 + mid * 2);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x, l = (x / W + (1 - y / H)) / 2 + (warp[i] - 0.5) * warpK, u = Math.abs(l - c) / half;
        d[i * 4 + 3] = (u >= 1 ? 0 : (1 - u * u * (3 - 2 * u)) * (base + range * density[i])) * 255;
      }
      g.putImageData(img, 0, 0);
      raf = requestAnimationFrame(frame);
    };
    const on = () => { if (!img) tint(); start = performance.now(); if (!raf) raf = requestAnimationFrame(frame); };
    el.addEventListener("mouseenter", on);
    return () => { el.removeEventListener("mouseenter", on); cancelAnimationFrame(raf); cv.remove(); };
  });
})();
