// Wordmark redrawn by slicing letters into a few rows of horizontal pill bars — each bar slides to a random left or right spot at its own tempo
(() => {
  const NS = "http://www.w3.org/2000/svg";
  // Drawing at the same coordinate height as the original wordmark SVG height (159.7) keeps the shake width given in rem in the same ratio as the original
  const UNITS = 160;

  function slice(text, font, rows, gap, stretch) {
    const size = 200;
    const c = document.createElement("canvas");
    const g = c.getContext("2d", { willReadFrequently: true });
    g.font = `${font.weight} ${size}px ${font.family}`;
    const w = Math.ceil(g.measureText(text).width) + size;
    c.width = w; c.height = size * 1.6;
    g.font = `${font.weight} ${size}px ${font.family}`;
    g.textBaseline = "alphabetic";
    g.fillText(text, size / 2, size * 1.15);
    const data = g.getImageData(0, 0, c.width, c.height).data;
    const ink = (x, y) => data[(y * c.width + x) * 4 + 3] > 128;
    let x0 = c.width, x1 = -1, y0 = c.height, y1 = -1;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (ink(x, y)) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) return null;
    const band = (y1 - y0 + 1) / rows, scale = UNITS / (y1 - y0 + 1);
    const bars = [];
    for (let r = 0; r < rows; r++) {
      // If three or more of the five rows within the band’s central 60% are covered, the cell counts as filled — so strokes thinner than the band don’t break or join
      const ys = [0.2, 0.35, 0.5, 0.65, 0.8].map((f) => Math.min(c.height - 1, Math.round(y0 + band * (r + f))));
      let start = -1;
      for (let x = x0; x <= x1 + 1; x++) {
        const on = x <= x1 && ys.filter((y) => ink(x, y)).length >= 3;
        if (on && start < 0) start = x;
        if (!on && start >= 0) {
          const h = band * (1 - gap);
          let len = x - start;
          if (len >= h * 0.35) {
            let bx = start;
            if (len < h) { bx -= (h - len) / 2; len = h; }
            // Even if shrunk or stretched only horizontally, the bar height and rounded ends stay — the font width is fitted to the wordmark ratio
            const w = Math.max(h, len * stretch);
            bars.push({ x: (bx - x0) * stretch * scale - (w - len * stretch) * scale / 2, y: (band * r + (band * gap) / 2) * scale, w: w * scale, h: h * scale });
          }
          start = -1;
        }
      }
    }
    return { bars, width: (x1 - x0 + 1) * stretch * scale, height: UNITS };
  }

  kfFx.register("pill-row-wordmark", (el, { options, reduce }) => {
    const text = (options.text || el.getAttribute("aria-label") || el.textContent).trim();
    if (!text) return;
    const rows = +options.rows || 7, gap = +(options.gap ?? 0.22), every = +options.every || 1000, stretch = +options.stretch || 1;
    const amp = +(options.amp ?? 0.4), ampNarrow = +(options["amp-narrow"] ?? 0.7), narrow = +options.narrow || 768;
    const layers = /look:\s*halo/.test(el.getAttribute("data-fx-pill-row-wordmark") || "") ? ["back", "mid", "front"] : ["front"];
    if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", text);
    const kept = [...el.childNodes];
    const label = document.createElement("span");
    label.className = "fx-pill-label";
    kept.forEach((n) => label.append(n));
    el.append(label);
    let svg = null, timers = [], alive = true;

    const draw = () => {
      if (!alive) return;
      const cs = getComputedStyle(el);
      const out = slice(text, { family: cs.fontFamily, weight: cs.fontWeight }, rows, gap, stretch);
      if (!out) return;
      svg?.remove();
      timers.forEach(clearInterval); timers = [];
      svg = document.createElementNS(NS, "svg");
      svg.setAttribute("class", "fx-pill-svg");
      svg.setAttribute("aria-hidden", "true");
      const pad = layers.length > 1 ? out.height * 0.08 : 0;
      svg.setAttribute("viewBox", `${-pad} ${-pad} ${out.width + pad * 2} ${out.height + pad * 2}`);
      const groups = layers.map((name) => { const gEl = document.createElementNS(NS, "g"); gEl.setAttribute("class", `fx-pill-${name}`); svg.append(gEl); return gEl; });
      const rects = out.bars.map((b) => groups.map((gEl) => {
        const r = document.createElementNS(NS, "rect");
        r.setAttribute("x", b.x.toFixed(2)); r.setAttribute("y", b.y.toFixed(2));
        r.setAttribute("width", b.w.toFixed(2)); r.setAttribute("height", b.h.toFixed(2));
        r.setAttribute("rx", (b.h / 2).toFixed(2));
        gEl.append(r);
        return r;
      }));
      el.append(svg);
      if (reduce || !amp) return;
      // Each bar picks a random position within ±width rem on its own 1 second tempo — original $e(x): half-and-half sign × Math.random() × x
      for (const set of rects) {
        timers.push(setInterval(() => {
          const a = innerWidth >= narrow ? amp : ampNarrow;
          const d = (Math.random() < 0.5 ? -1 : 1) * Math.random() * a;
          for (const r of set) r.style.transform = `translateX(${d}rem)`;
        }, every));
      }
    };
    const cs = getComputedStyle(el);
    const ready = document.fonts?.load ? document.fonts.load(`${cs.fontWeight} 100px ${cs.fontFamily}`, text).catch(() => {}) : Promise.resolve();
    ready.then(draw);
    return () => {
      alive = false;
      timers.forEach(clearInterval);
      svg?.remove();
      [...label.childNodes].forEach((n) => el.insertBefore(n, label));
      label.remove();
    };
  });
})();
