// Hero line-art pattern, four layers — scattered only inside the visible band, leaving the logo, one-line copy and lower About text areas empty (the original pattern art is empty there too).
(() => {
  const { scatter } = window.tcArt;
  const fill = (sel, { w, h, rx, ry, ...rest }) => {
    const layers = scatter({ w: w * (rx[1] - rx[0]), h: h * (ry[1] - ry[0]), layers: 4, ...rest });
    document.querySelectorAll(sel).forEach((svg, i) => {
      svg.innerHTML = `<g transform="translate(${(w * rx[0]).toFixed(1)} ${(h * ry[0]).toFixed(1)})">${layers[i]}</g>`;
    });
  };
  // Wide panel: the pattern art is 140% of the hero width (3148×2514) — it fills only .18~.85 horizontally and .17~.92 vertically of what the hero shows
  fill(".tc-layer.is-pc", {
    w: 3148, h: 2514, rx: [0.18, 0.85], ry: [0.17, 0.92], cols: 10, rows: 9, size: 220, seed: 11, jitter: 0.26,
    // Vacancy is judged by the picture center, so widen it by half the picture size (.05 wide, .06 tall)
    skip: [[0.16, 0.2, 0.51, 0.57], [0.46, 0.26, 0.87, 0.5], [0.16, 0.8, 0.84, 1.01]],
  });
  // Phone: tall vertical pattern (497×1027)
  fill(".tc-layer.is-sp", {
    w: 497, h: 1027, rx: [0.08, 0.86], ry: [0, 0.94], cols: 6, rows: 15, size: 64, seed: 23, jitter: 0.24,
    skip: [[0.24, 0.25, 0.78, 0.49], [0.04, 0.56, 0.96, 0.67]],
  });
})();
