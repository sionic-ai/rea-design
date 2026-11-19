// Image slots in About — the original is one 3D render each, so redraw them as character art in the same place and size
(() => {
  const put = (name, html) => { const el = document.querySelector(`[data-scene="${name}"]`); if (el) el.innerHTML = html; };
  const podiums = [[40, 230, 90, 120], [170, 180, 70, 170], [270, 210, 90, 110], [380, 160, 60, 190], [120, 290, 100, 60], [280, 280, 80, 70], [440, 230, 70, 90], [500, 170, 50, 160]]
    .map(([x, y, w, h]) => TS.podium(x, y, w, h)).join("");
  put("outline", TS.group([
    ["leaf", "c3", "c4", 30, 120, 90], ["cluster", "c5", "c4", 60, 170, 110], ["gem", "c2", "c1", 180, 70, 90], ["poly", "c1", "c2", 300, 100, 90],
    ["swirl", "c2", "c3", 400, 70, 80], ["cube", "c5", "c4", 270, 220, 70], ["steps", "c4", "c6", 470, 120, 70], ["gem", "c2", "c6", 380, 200, 60], ["blob", "c2", "c6", 140, 230, 70],
  ], 600, 400, podiums));
  put("blocks", TS.group([["cube", "c3", "c4", 30, 60, 160], ["cube", "c6", "c5", 160, 30, 150], ["cube", "c4", "c1", 110, 150, 160], ["steps", "c2", "c6", 230, 150, 120]], 400, 400));
  put("crystals", TS.group([["gem", "c2", "c1", 60, 40, 150], ["gem", "c4", "c3", 200, 70, 130], ["cluster", "c5", "c4", 110, 170, 150], ["poly", "c1", "c2", 230, 210, 120], ["leaf", "c3", "c4", 40, 200, 100]], 400, 400));
  // Tube: color-ball characters over a thick translucent curve
  const tube = '<path d="M20 250C120 260 180 120 300 160S470 330 560 200 650 40 690 60" fill="none" style="stroke: var(--kf-raised)" stroke-width="46" stroke-linecap="round"/><path d="M20 250C120 260 180 120 300 160S470 330 560 200 650 40 690 60" fill="none" style="stroke: var(--kf-surface)" stroke-width="30" stroke-linecap="round" stroke-opacity=".8"/>';
  put("tube", TS.group([["swirl", "c2", "c3", 40, 210, 70], ["blob", "c3", "c4", 180, 150, 60], ["cluster", "c5", "c6", 300, 140, 60], ["gem", "c6", "c5", 420, 230, 60], ["gear", "c2", "c1", 560, 160, 60], ["swirl", "c5", "c4", 640, 30, 50]], 700, 340, tube));
})();
