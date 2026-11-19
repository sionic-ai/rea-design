// Work archive: each cell cuts a photo into one of four shapes — star·circle·triangle·blob — in rotation, filtered by branch buttons (when several are chosen, shown if any one matches),
// The ◻︎ / ≡ pillar at bottom right toggles grid and list — same behavior as the original works.js, only the data is our placeholder
(() => {
  const shapes = ["shape-star", "shape-circle", "shape-triangle", "shape-blob"];
  const T = ["Your work title here", "Project Name", "Short Title", "Your long two-line work title here", "Title 00", "Work Name"];
  const A = ["Name Name", "Name Name / Name Name", "Family Given"];
  const G = [["game"], ["web/app"], ["interactive"], ["book", "photo"], ["installation", "sound"], ["video"], ["typography"], ["product"], ["illustration", "typography"], ["experience", "graphic"], ["painting"], ["book"], ["installation"], ["textile", "book"], ["uiux"], ["workshop", "experience"]];
  const P = ["Work photo · in-screen game scene · blue night", "Work photo · phone screen in hand", "Work photo · gallery installation · dim lighting", "Artwork photo · Open book · From above", "Artwork photo · Installation hung from the ceiling", "Work photo · Video still", "Work photo · Lettering poster", "Work photo · product cutout · white background"];
  const works = G.map((tags, i) => ({ id: `w${i + 1}`, title: T[i % T.length], author: A[i % A.length], tags, semi: `Name Semi. 0${(i % 6) + 1}`, photo: P[i % P.length] }));

  const grid = document.getElementById("worksGrid");
  const active = new Set();

  const renderGrid = () => {
    grid.innerHTML = works.map((w, i) => `
      <li class="work ${shapes[i % shapes.length]}" data-tags="${w.tags.join(" ")}">
        <div class="work-title"><div>${w.title}</div><div class="work-author">${w.author}</div></div>
        <div class="work-tag">${w.tags.map((t) => `#${t}`).join(" ")}</div>
        <div class="work-img"><div class="wf-img ph" data-label="${w.photo} · Cropped to a 3:2 shape"></div></div>
      </li>`).join("");
    filter();
  };
  const renderList = () => {
    grid.innerHTML = works.map((w) => `
      <li class="work-list-item" data-tags="${w.tags.join(" ")}"><span class="list-title">${w.title}</span><span class="list-author">${w.author}</span><span class="list-semi">${w.semi}</span></li>`).join("");
  };
  const filter = () => {
    grid.querySelectorAll(".work").forEach((el) => {
      const tags = el.dataset.tags.split(" ");
      el.classList.toggle("is-hidden", active.size > 0 && !tags.some((t) => active.has(t)));
    });
  };

  document.querySelectorAll(".works-tags button").forEach((b) => b.addEventListener("click", () => {
    const t = b.dataset.filter;
    b.classList.toggle("is-active");
    active.has(t) ? active.delete(t) : active.add(t);
    filter();
  }));

  document.getElementById("navSections")?.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-view]");
    if (!a) return;
    e.preventDefault();
    const v = a.dataset.view;
    document.body.classList.toggle("is-grid", v === "grid");
    document.body.classList.toggle("is-list", v === "list");
    v === "grid" ? renderGrid() : renderList();
  });

  renderGrid();
})();
