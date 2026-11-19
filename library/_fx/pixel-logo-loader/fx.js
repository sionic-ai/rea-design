// First-visit loader: redraws the logo (SVG) at the center of a background-color veil as accent-color pixel cells — the cell count shrinks 88·44·26·16·12 so the mosaic gets coarser,
// scaled 1.7 and 2.6× from 12 cells, then the whole curtain becomes the accent color, and fx:done fires when the curtain starts lifting in 1s (Studio PageTransition).
// Each cell measures its coverage ratio from the cumulative sum of the logo alpha (an integral image) and paints only cells above a threshold — the coarser the grid, the higher the threshold, so the letter shape remains
(() => {
  const STEPS = "88:.5, 44:.4, 26:.3, 16:.12, 12:.02, 12:.02:1.7, 12:.02:2.6";
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  kfFx.register("pixel-logo-loader", (el, { options, reduce }) => {
    const logo = el.querySelector('[data-fx-part="logo"]');
    const root = document.documentElement;
    const fire = () => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    let seen = false;
    if (options.once) {
      try { seen = !!sessionStorage.getItem(options.once); sessionStorage.setItem(options.once, "1"); } catch {}
    }
    if (!logo || reduce || seen) {
      el.classList.add("is-done");
      const t = setTimeout(fire, 0);
      return () => { clearTimeout(t); el.classList.remove("is-done"); };
    }

    root.dataset.fxLoader = "on";
    const steps = String(options.steps || STEPS).split(",").map((s) => {
      const [cols, threshold, zoom] = s.trim().split(":").map(Number);
      return { cols: cols || 12, threshold: threshold ?? 0.02, zoom: zoom || 1 };
    });
    const wait = +(options.wait ?? 0.5) * 1000, each = +(options.each ?? 0.1) * 1000;
    const hold = +(options.hold ?? 0.24) * 1000, out = +(options.out ?? 1) * 1000;
    const wide = +(options.size ?? 0.733), narrow = +(options.sizesm ?? 0.86), fit = +(options.fit ?? 0.662);
    el.style.setProperty("--fx-out", `${out}ms`);

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    el.append(canvas);
    const g = canvas.getContext("2d");
    const vb = (logo.getAttribute("viewBox") || "0 0 100 50").split(/[\s,]+/).map(Number);
    const ratio = vb[3] / vb[2];
    let alive = true, img = null, sum = null, box = { x: 0, y: 0, w: 0, h: 0 }, grids = [], dpr = 1, vw = 0, vh = 0, redraw = () => {};
    const colors = () => {
      const cs = getComputedStyle(el);
      return { pixel: cs.getPropertyValue("--fx-pixel").trim() || cs.color, bg: cs.getPropertyValue("--fx-bg").trim() || cs.backgroundColor };
    };
    let col = colors();

    const cover = (x0, y0, x1, y1) => {
      const W = box.w + 1;
      const a = Math.max(0, Math.min(box.w, Math.round(x0))), b = Math.max(0, Math.min(box.h, Math.round(y0)));
      const c = Math.max(0, Math.min(box.w, Math.round(x1))), d = Math.max(0, Math.min(box.h, Math.round(y1)));
      const area = (x1 - x0) * (y1 - y0);
      if (c <= a || d <= b || area <= 0) return 0;
      return (sum[d * W + c] - sum[b * W + c] - sum[d * W + a] + sum[b * W + a]) / area;
    };
    const measure = () => {
      if (!img) return;
      dpr = Math.min(devicePixelRatio || 1, 2);
      vw = innerWidth; vh = innerHeight;
      canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr);
      const w = Math.max(1, Math.round(Math.min(vw * (vw < 768 ? narrow : wide), (vh * fit) / ratio))), h = Math.max(1, Math.round(w * ratio));
      box = { x: Math.round((vw - w) / 2), y: Math.round((vh - h) / 2), w, h };
      const off = document.createElement("canvas");
      off.width = w; off.height = h;
      const o = off.getContext("2d", { willReadFrequently: true });
      o.drawImage(img, 0, 0, w, h);
      const px = o.getImageData(0, 0, w, h).data;
      sum = new Float32Array((w + 1) * (h + 1));
      for (let y = 1; y <= h; y++) {
        let row = 0;
        for (let x = 1; x <= w; x++) {
          row += px[((y - 1) * w + (x - 1)) * 4 + 3] / 255;
          sum[y * (w + 1) + x] = sum[(y - 1) * (w + 1) + x] + row;
        }
      }
      grids = steps.map(({ cols, threshold }) => {
        const size = w / cols, rows = Math.ceil(h / size), cells = [];
        for (let r = -1; r <= rows; r++)
          for (let c = -1; c <= cols; c++) if (cover(c * size, r * size, c * size + size, r * size + size) > threshold) cells.push([c, r]);
        return { size, cells };
      });
    };
    const flood = (color) => { g.fillStyle = color; g.fillRect(0, 0, canvas.width, canvas.height); };
    const drawLogo = () => { redraw = drawLogo; flood(col.bg); if (img) g.drawImage(img, box.x * dpr, box.y * dpr, box.w * dpr, box.h * dpr); };
    const drawStep = (i) => {
      redraw = () => drawStep(i);
      flood(col.bg);
      g.fillStyle = col.pixel;
      const z = steps[i].zoom, { size, cells } = grids[i], cx = vw / 2, cy = vh / 2;
      const X = (c) => Math.round((cx + (box.x + c * size - cx) * z) * dpr), Y = (r) => Math.round((cy + (box.y + r * size - cy) * z) * dpr);
      for (const [c, r] of cells) { const x = X(c), y = Y(r); g.fillRect(x, y, X(c + 1) - x, Y(r + 1) - y); }
    };
    const drawFill = () => { redraw = drawFill; flood(col.pixel); };
    let rz = 0;
    const onResize = () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { col = colors(); measure(); redraw(); }); };
    addEventListener("resize", onResize);

    const visible = () => new Promise((res) => {
      const hidden = () => document.hidden || document.prerendering === true;
      if (!hidden()) return res();
      const on = () => { if (!hidden()) { document.removeEventListener("visibilitychange", on); res(); } };
      document.addEventListener("visibilitychange", on);
    });
    const end = () => { el.classList.add("is-done"); };
    const svg = new XMLSerializer().serializeToString(logo).replaceAll("currentColor", col.pixel);
    const pic = new Image();
    pic.onload = async () => {
      if (!alive) return;
      img = pic; measure(); drawLogo(); el.classList.add("is-canvas");
      await visible();
      await sleep(wait);
      for (let i = 0; i < steps.length && alive; i++) { drawStep(i); await sleep(each); }
      if (!alive) return;
      drawFill();
      await sleep(hold);
      if (!alive) return;
      delete root.dataset.fxLoader;
      fire();
      el.classList.add("is-fading");
      await sleep(out);
      if (alive) end();
    };
    pic.onerror = () => { delete root.dataset.fxLoader; end(); fire(); };
    pic.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    const safety = setTimeout(() => { if (!el.classList.contains("is-done")) { delete root.dataset.fxLoader; end(); fire(); } }, 5000);

    return () => {
      alive = false;
      clearTimeout(safety);
      removeEventListener("resize", onResize);
      canvas.remove();
      delete root.dataset.fxLoader;
      el.classList.remove("is-canvas", "is-fading", "is-done");
    };
  });
})();
