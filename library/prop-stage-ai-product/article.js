(() => {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const css = (n) => { const [r, g, b] = twColor(n); return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`; }; /* Not skin: line that turns a value read from skin variables into a chart fill */

  // Index: the section being read turns bold
  const links = $$(".tw-toc a");
  const heads = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const mark = () => {
    let on = 0;
    heads.forEach((h, i) => { if (h.getBoundingClientRect().top < innerHeight * 0.3) on = i; });
    links.forEach((a, i) => a.classList.toggle("is-on", i === on));
  };
  addEventListener("scroll", mark, { passive: true });
  mark();
  links.forEach((a) => a.addEventListener("click", (e) => {
    const t = document.querySelector(a.getAttribute("href"));
    if (!t || !window.twLenis) return;
    e.preventDefault();
    window.twLenis.scrollTo(t, { offset: -100 });
  }));

  // Table: pressing a column title sorts the rows by that column
  $$(".tw-table table").forEach((table) => {
    const body = table.tBodies[0];
    $$("th", table).forEach((th, col) => th.addEventListener("click", () => {
      const down = th.getAttribute("aria-sort") !== "descending";
      $$("th", table).forEach((o) => o.removeAttribute("aria-sort"));
      th.setAttribute("aria-sort", down ? "descending" : "ascending");
      const rows = [...body.rows].sort((a, b) => {
        const x = a.cells[col].textContent, y = b.cells[col].textContent;
        const nx = parseFloat(x), ny = parseFloat(y);
        const d = isNaN(nx) ? x.localeCompare(y) : nx - ny;
        return down ? -d : d;
      });
      rows.forEach((r) => body.append(r));
    }));
  });

  // Copy example·prompt
  $$(".tw-quote button, .tw-code button").forEach((b) => b.addEventListener("click", () => {
    const box = b.parentElement;
    navigator.clipboard?.writeText(box.textContent.trim()).catch(() => {});
    box.classList.add("is-copied");
    setTimeout(() => box.classList.remove("is-copied"), 1200);
  }));

  // Graph — Chart.js 4.5.1, same as the original. Values are placeholder numbers
  if (!window.Chart) return;
  const ink = css("--kf-ink-soft"), dim = css("--kf-dim"), line = css("--kf-line");
  const palette = ["--kf-accent", "--kf-success", "--kf-danger", "--kf-warning", "--kf-ink", "--kf-dim"].map(css);
  Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
  Chart.defaults.font.size = 11;
  Chart.defaults.color = dim;
  Chart.defaults.animation.duration = 600;
  const sc = document.getElementById("tw-scatter");
  if (sc) {
    const pts = Array.from({ length: 12 }, (_, i) => ({ x: 0.2 + i * 0.37 + ((i * 7) % 5) * 0.11, y: 20 + ((i * 37) % 60), n: `Name ${String(i + 1).padStart(2, "0")}` }));
    new Chart(sc, {
      type: "scatter",
      data: { datasets: pts.map((p, i) => ({ label: p.n, data: [p], backgroundColor: palette[i % palette.length], pointRadius: 5, pointHoverRadius: 7 })) },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom", labels: { boxWidth: 8, boxHeight: 8, usePointStyle: true } }, tooltip: { backgroundColor: ink, padding: 8, cornerRadius: 6 } },
        scales: { x: { grid: { color: line }, title: { display: true, text: "Value (placeholder)" } }, y: { grid: { color: line }, title: { display: true, text: "Score" } } },
      },
    });
  }
  const multi = document.querySelector(".tw-multi");
  if (multi) {
    for (let k = 0; k < 6; k++) {
      const cell = document.createElement("div");
      cell.className = "tw-multi__cell";
      cell.innerHTML = `<span>Name ${String(k + 1).padStart(2, "0")}</span><canvas></canvas>`;
      multi.append(cell);
      const data = Array.from({ length: 6 }, (_, i) => 40 + Math.round(20 * Math.sin(i * 0.9 + k) + ((i + k) % 3) * 4));
      new Chart(cell.querySelector("canvas"), {
        type: "line",
        data: { labels: ["0", "1", "2", "3", "4", "5"], datasets: [{ data, borderColor: palette[0], backgroundColor: palette[0], borderWidth: 1.5, pointRadius: 2, tension: 0.3 }] },
        options: { maintainAspectRatio: false, layout: { padding: { top: 16 } }, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: line }, min: 0, max: 100, ticks: { maxTicksLimit: 3 } } } },
      });
    }
  }
})();
