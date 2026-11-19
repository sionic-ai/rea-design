// Confetti behind the sections — 50 pieces per screen height (769~1279px 45 · 768px and below 30), splitting the side margins into 12 (8·6) columns and placing one piece per column in turn at a random spot.
// At 1280px and up it falls straight from 500px above the panel to panel height + 1000px below over 80~90s (phone·tablet 60~80s values kept), below that width it stays within ±35% of the cell grid center.
// Each piece sways 10~30px (phone 8~23) left and right over 5~8s and makes one rotation in 10s (random direction). Start positions are scattered with negative delays (original values)
(() => {
  const SHAPES = [
    (c) => `<rect x="26" y="34" width="28" height="13" rx="3" fill="${c}"/>`,
    (c) => `<circle cx="40" cy="40" r="10" fill="${c}"/>`,
    (c) => `<path d="M20 44 q10 -18 20 0 q10 18 20 0" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`,
    (c) => `<path d="M40 24 L43.5 36.5 L56 40 L43.5 43.5 L40 56 L36.5 43.5 L24 40 L36.5 36.5Z" fill="${c}"/>`,
  ];
  kfFx.register("confetti-fall", (el, { options, reduce }) => {
    const sp = matchMedia("(max-width: 768px)").matches, tab = !sp && matchMedia("(max-width: 1279px)").matches;
    const CFG = sp ? { per: 30, pad: 20, cols: 6, size: 40, dur: 60, durR: 20, sway: 8, swayR: 15 }
      : tab ? { per: 45, pad: 30, cols: 8, size: 60, dur: 60, durR: 20, sway: 10, swayR: 20 }
      : { per: 50, pad: 50, cols: 12, size: 70, dur: 80, durR: 10, sway: 10, swayR: 20 };
    const per = +(options.per ?? CFG.per);
    const colors = (options.colors || "--kf-accent --kf-accent-soft --kf-accent-text --kf-surface --kf-ink-soft").split(/\s+/).map((v) => `var(${v})`);
    const falls = !sp && !tab && !reduce && options.still !== "true";
    const build = () => {
      const h = el.offsetHeight, w = el.offsetWidth - CFG.pad * 2, cell = w / CFG.cols;
      if (!h || !w) return;
      const n = Math.ceil((h / innerHeight) * per), rows = Math.ceil(n / CFG.cols), cellH = (h + 120) / rows;
      let html = "";
      for (let i = 0; i < n; i++) {
        const col = i % CFG.cols, row = Math.floor(i / CFG.cols), fall = CFG.dur + Math.random() * CFG.durR;
        const [x, y] = falls
          ? [CFG.pad + col * cell + Math.random() * cell, -500]
          : [CFG.pad + col * cell + cell / 2 + (Math.random() - 0.5) * cell * 0.7 - CFG.size / 2, row * cellH + cellH / 2 + 20 + (Math.random() - 0.5) * cellH * 0.7 - CFG.size / 2];
        const c = colors[Math.floor(Math.random() * colors.length)];
        html += `<b style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;width:${CFG.size}px;--fx-h:${h + 1000}px;--fx-fall:${fall.toFixed(2)}s;--fx-delay:${(-Math.random() * fall).toFixed(2)}s">` +
          `<i style="--fx-sway:${(CFG.sway + Math.random() * CFG.swayR).toFixed(1)}px;--fx-sway-d:${(5 + Math.random() * 3).toFixed(2)}s">` +
          `<s style="--fx-dir:${Math.random() < 0.5 ? 1 : -1};--fx-spin-delay:${(-Math.random() * 10).toFixed(2)}s"><svg viewBox="0 0 80 80">${SHAPES[Math.floor(Math.random() * 4)](c)}</svg></s></i></b>`;
      }
      layer.innerHTML = html;
    };
    const layer = document.createElement("span");
    layer.dataset.fxPart = "layer";
    layer.classList.toggle("is-still", !falls);
    el.append(layer);
    build();
    // Many sections get their board height late (fonts · images), so re-lay it out when the height changes
    let lastH = el.offsetHeight;
    const ro = new ResizeObserver(() => { if (Math.abs(el.offsetHeight - lastH) > 40) { lastH = el.offsetHeight; build(); } });
    ro.observe(el);
    return () => { ro.disconnect(); layer.remove(); };
  });
})();
