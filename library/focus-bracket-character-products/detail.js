// Product detail image spots: copies usage icons, and redraws the long-use value chart and gloss line graph as SVG (the original is image files). Colors use only product color variables
(() => {
  const icons = [...document.querySelectorAll(".dt-mv__icon svg")].map((s) => s.outerHTML);
  document.querySelectorAll(".dt-related__icons [data-icon]").forEach((li) => (li.innerHTML = icons[+li.dataset.icon - 1] || ""));

  const lines = document.querySelector('[data-chart="lines"]');
  if (lines) {
    const W = 600, H = 375, L = 50, B = 330, T = 20, R = 590;
    const xs = [0, 144, 288, 432, 576, 720, 864, 1008, 1152];
    const series = [["c1", [100, 100, 99, 99, 98, 98, 97, 96, 96]], ["c2", [100, 99, 98, 97, 95, 92, 90, 88, 87]], ["c3", [100, 98, 96, 93, 90, 85, 82, 80, 78]],
      ["c5", [100, 99, 97, 96, 94, 93, 91, 90, 89]], ["c6", [100, 96, 92, 86, 80, 74, 70, 66, 63]], ["c4", [100, 97, 94, 91, 88, 86, 84, 83, 82]]];
    const px = (i) => L + (i / (xs.length - 1)) * (R - L), py = (v) => B - ((v - 60) / 70) * (B - T);
    const grid = [60, 70, 80, 90, 100, 110, 120, 130].map((v) => `<line x1="${L}" x2="${R}" y1="${py(v)}" y2="${py(v)}" style="stroke: var(--kf-line)" stroke-width=".6"/><text x="${L - 8}" y="${py(v) + 4}" text-anchor="end" style="fill: var(--kf-dim); font: 10px var(--kf-font-display)">${v}</text>`).join("");
    const ticks = xs.map((x, i) => `<text x="${px(i)}" y="${B + 18}" text-anchor="middle" style="fill: var(--kf-dim); font: 10px var(--kf-font-display)">${x}</text>`).join("");
    const paths = series.map(([c, vs]) => `<polyline points="${vs.map((v, i) => `${px(i)},${py(v)}`).join(" ")}" fill="none" style="stroke: var(--site-${c})" stroke-width="2"/>${vs.map((v, i) => `<circle cx="${px(i)}" cy="${py(v)}" r="3" style="fill: var(--site-${c})"/>`).join("")}`).join("");
    lines.innerHTML = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">${grid}${ticks}<text x="${(L + R) / 2}" y="${H - 6}" text-anchor="middle" style="fill: var(--kf-dim); font: 10px var(--kf-font-sans)">Exam time (h)</text>${paths}</svg>`;
  }

  const cost = document.querySelector('[data-chart="cost"]');
  if (cost) {
    const rows = [["c2", "Product 1", [30]], ["c1", "Product 2", [20, 40]], ["c3", "Product 3", [10, 20, 30]]];
    const x = (yr) => 200 + (yr / 30) * 360;
    const body = rows.map(([c, name, ys], r) => {
      const y = 60 + r * 70;
      const dots = ys.map((yr) => `<circle cx="${x(yr)}" cy="${y}" r="14" style="fill: var(--site-${c})" fill-opacity=".85"/><text x="${x(yr)}" y="${y - 22}" text-anchor="middle" style="fill: var(--kf-ink-soft); font: 11px var(--kf-font-display)">${yr}</text>`).join("");
      return `<text x="24" y="${y + 4}" style="fill: var(--kf-ink); font: 13px var(--kf-font-sans)">${name}</text><line x1="190" x2="570" y1="${y}" y2="${y}" style="stroke: var(--kf-line)" stroke-dasharray="3 4"/>${dots}<rect x="600" y="${y - 18}" width="50" height="36" style="fill: var(--kf-surface); stroke: var(--kf-line)"/><text x="625" y="${y + 5}" text-anchor="middle" style="fill: var(--kf-ink); font: 14px var(--kf-font-display)">${ys.length}</text>`;
    }).join("");
    cost.innerHTML = `<svg viewBox="0 0 700 300" aria-hidden="true">${body}<text x="625" y="20" text-anchor="middle" style="fill: var(--kf-dim); font: 11px var(--kf-font-sans)">Coats Applied</text></svg>`;
  }
})();
