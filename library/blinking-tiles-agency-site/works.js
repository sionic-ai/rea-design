// Work grid — each row type lays four cells (photo, text, black cell, award), and when the pointer lands on a cell only that work’s photo remains and cell lines and crosses turn on.
// On filtering, the row layout is laid out again in a fixed order (X) like the original. List view is a table where rows grow on hover.
(() => {
  const works = window.unWorks, rowsAll = window.unRows;
  const J = {
    wide: [{ k: "image", p: "a", span: 2 }, { k: "text", p: "a", side: "left" }, { k: "black" }],
    "pair-inside": [{ k: "text", p: "a", side: "right" }, { k: "image", p: "a" }, { k: "image", p: "b" }, { k: "text", p: "b", side: "left" }],
    "pair-outside": [{ k: "image", p: "a" }, { k: "text", p: "a", side: "left" }, { k: "text", p: "b", side: "right" }, { k: "image", p: "b" }],
    awards: [{ k: "awards" }, { k: "image", p: "a", span: 2 }, { k: "text", p: "a", side: "left" }],
    "pair-left": [{ k: "image", p: "a" }, { k: "text", p: "a", side: "left" }, { k: "image", p: "b" }, { k: "text", p: "b", side: "left" }],
    "pair-right": [{ k: "text", p: "a", side: "right" }, { k: "image", p: "a" }, { k: "text", p: "b", side: "right" }, { k: "image", p: "b" }],
    "wide-right": [{ k: "black" }, { k: "text", p: "a", side: "right" }, { k: "image", p: "a", span: 2 }],
  };
  const X = ["wide", "pair-inside", "pair-outside", "awards", "pair-left", "pair-right", "wide-right", "pair-outside"];
  const two = (l) => J[l].some((c) => c.p === "b");
  const grid = document.querySelector("[data-grid]"), listEl = document.querySelector("[data-list]");
  const pad = (n) => String(n).padStart(3, "0");
  let filter = "all", view = "grid";

  const cellsFor = () => {
    const out = [], seen = { awards: false };
    const list = filter === "all" ? works : works.filter((w) => w.cats.includes(filter));
    const push = (layout, a, b) => J[layout].forEach((c) => {
      if (c.k === "awards") { out.push({ k: seen.awards ? "black" : "awards" }); seen.awards = true; return; }
      if (c.k === "black") return out.push({ k: "black" });
      const w = c.p === "a" ? a : b;
      out.push(w ? { ...c, w } : { k: "empty", span: c.span });
    });
    let i = 0;
    if (filter === "all") for (const [layout, n] of rowsAll) { push(layout, list[i], n > 1 ? list[i + 1] : null); i += n; }
    for (let r = 0; i < list.length; r++) { const l = X[r % X.length]; push(l, list[i], two(l) ? list[i + 1] : null); i += two(l) ? 2 : 1; }
    return { cells: out, list };
  };
  const arrow = window.unArrow;
  const render = () => {
    const { cells, list } = cellsFor();
    const idx = (w) => pad(list.indexOf(w) + 1);
    grid.innerHTML = cells.map((c) => {
      const span = c.span ? ` style="grid-column: span ${c.span}"` : "";
      if (c.k === "black") return `<div class="project-index__cell is-black" data-fx-part="cell"></div>`;
      if (c.k === "empty") return `<div class="project-index__cell is-empty" data-fx-part="cell"${span}></div>`;
      if (c.k === "awards") return `<div class="project-index__cell project-index__awards"><span class="t-ui project-index__awards-label">Awards</span><span class="t-figure project-index__awards-num">00</span><p class="t-text">Your two-line intro here to awards received — from respected places.</p></div>`;
      if (c.k === "image") return `<a class="project-index__cell project-index__image" href="${c.w.url}" data-fx-part="cell" data-key="${c.w.name}"${span} tabindex="-1"><span class="wf-img fill${c.w.video ? " wf-video" : ""}" data-fx-part="photo" data-label="${c.w.video ? "Video · " : ""}${c.w.label}"></span></a>`;
      return `<a class="project-index__cell project-index__text has-arrow is-${c.side}" href="${c.w.url}" data-fx-part="note" data-key="${c.w.name}">
        <span class="project-index__view t-ui"><span>View</span>${arrow}</span>
        <span class="project-index__rank">${idx(c.w)}</span>
        <span class="project-index__caption"><span class="project-index__name t-text">${c.w.name}</span><span class="project-index__excerpt t-text">${c.w.excerpt}</span><span class="project-index__services t-text">${c.w.services}</span></span></a>`;
    }).join("");
    listEl.innerHTML = list.map((w, i) => `<a class="project-index__row" href="${w.url}">
      <span class="project-index__thumb"><span class="wf-img fill" data-label="${w.label}"></span></span>
      <span class="project-index__row-rank t-ui">${pad(i + 1)}</span>
      <span class="project-index__row-name t-menu">${w.name}</span>
      <span class="project-index__row-services t-text">${w.services}</span>
      <span class="project-index__row-year">${w.year}</span>
      <i class="project-index__row-square"></i></a>`).join("");
    placeCrosses();
  };

  // Cell hover is the peek-grid-hover part — here only the cell cross is lit to match the changed key
  let crosses = [];
  const placeCrosses = () => {
    let n = 0;
    [...grid.children].forEach((c) => { if (!c.classList.contains("ui-grid-cross")) n += +(c.style.gridColumn.match(/\d+/)?.[0] || 1); });
    const pts = [];
    for (let r = 0; r <= Math.ceil(n / 4); r++) for (let c = 1; c < 4; c++) pts.push([`${(c / 4) * 100}%`, `calc(${r} * var(--row))`, 0]);
    crosses = window.unCrosses(grid, pts, false);
  };
  grid.addEventListener("fx:peek", (e) => {
    document.body.classList.toggle("is-works-hover", e.detail.key != null);
    const hit = e.detail.key == null ? [] : [...grid.querySelectorAll(`[data-key="${CSS.escape(e.detail.key)}"]`)].map((h) => h.getBoundingClientRect());
    crosses.forEach((x) => {
      const r = x.getBoundingClientRect(), cx = r.left + 5, cy = r.top + 5;
      x.classList.toggle("is-on", hit.some((b) => cx >= b.left - 2 && cx <= b.right + 2 && cy >= b.top - 2 && cy <= b.bottom + 2));
    });
  });

  // Filter · view switch — the changing panel exits and re-enters over .28s with 6px blur
  const swap = (fn) => {
    const host = document.querySelector(".project-index");
    host.classList.add("is-swapping");
    setTimeout(() => { fn(); requestAnimationFrame(() => host.classList.remove("is-swapping")); window.ScrollTrigger?.refresh(); }, 280);
  };
  document.querySelectorAll("[data-filter]").forEach((b) => b.addEventListener("click", () => {
    if (b.dataset.filter === filter) return;
    document.querySelectorAll("[data-filter]").forEach((x) => x.classList.toggle("is-active", x === b));
    filter = b.dataset.filter;
    swap(render);
  }));
  document.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => {
    if (b.dataset.view === view) return;
    document.querySelectorAll("[data-view]").forEach((x) => x.classList.toggle("is-on", x === b));
    view = b.dataset.view;
    swap(() => { grid.hidden = view !== "grid"; listEl.hidden = view !== "list"; });
  }));
  document.querySelectorAll("[data-filter]").forEach((b) => {
    const n = b.dataset.filter === "all" ? works.length : works.filter((w) => w.cats.includes(b.dataset.filter)).length;
    b.querySelector(".works-hero__count").textContent = String(n).padStart(2, "0");
  });
  document.querySelector(".works-hero__sup").textContent = `(${works.length})`;
  // Phone: tapping a list row expands it first, and opens it on the second tap
  listEl.addEventListener("click", (e) => {
    const row = e.target.closest(".project-index__row");
    if (!row || !matchMedia("(hover: none)").matches || row.classList.contains("is-open")) return;
    e.preventDefault(); e.stopPropagation();
    listEl.querySelectorAll(".is-open").forEach((r) => r.classList.remove("is-open"));
    row.classList.add("is-open");
  }, true);
  render();

  // Background curtain: .7 (.5s) when the grid’s top edge passes half the screen or a hand is on a cell. The background photo fades when the grid’s bottom edge comes within one screen below the screen.
  const back = document.querySelector(".works-backdrop__sticky");
  const host = document.querySelector(".project-index");
  let raf = 0;
  const upd = () => {
    raf = 0;
    const h = innerHeight, g = host.getBoundingClientRect();
    document.body.classList.toggle("is-works-deep", g.top < h / 2);
    back.style.opacity = Math.min(1, Math.max(0, (g.bottom - h) / h)).toFixed(3);
  };
  addEventListener("scroll", () => { raf ||= requestAnimationFrame(upd); }, { passive: true });
  const fit = () => { document.querySelector(".works-backdrop").style.height = `${host.offsetTop + host.offsetHeight}px`; upd(); };
  new ResizeObserver(fit).observe(host);
  fit();
})();
