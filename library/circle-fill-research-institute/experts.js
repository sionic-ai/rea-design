/* Experts — fills the placeholder person cards, with name search and team filtering (does the same job as the original filter plugin) */
(() => {
  const teams = ["research", "evaluation", "development", "operations"];
  const roles = ["Researcher", "Director", "Senior Manager", "Research Associate", "Vice President", "Analyst", "Program Lead"];
  document.querySelectorAll("[data-people]").forEach((grid) => {
    const n = +grid.dataset.count || 10, board = grid.hasAttribute("data-board");
    grid.innerHTML = Array.from({ length: n }, (_, i) => {
      const team = teams[i % teams.length];
      return `<a class="ex-card" href="#" data-team-of="${team}" data-name="person name ${String(i + 1).padStart(2, "0")}">
        <div class="ex-card__img"><div class="om-ph wf-img" data-label="${board ? "Relocation" : "Staff"} Face photo · in front of a cream wall · portrait 4:5"></div></div>
        <div><p class="ex-card__name">Person Name ${String(i + 1).padStart(2, "0")}</p><p class="ex-card__role">${board ? "Board Member · Org Name" : roles[i % roles.length]}</p></div>
      </a>`;
    }).join("");
  });
  document.querySelectorAll(".ex-card").forEach((c) => c.addEventListener("mouseleave", () => c.classList.add("is-left")));
  const find = document.querySelector("[data-find]");
  const filter = document.querySelector("[data-filter]");
  const label = document.querySelector("[data-filter-label]");
  const empty = document.querySelector("[data-empty]");
  let team = "";
  const apply = () => {
    const q = (find?.value || "").trim().toLowerCase();
    let shown = 0;
    document.querySelectorAll(".ex-top .ex-card").forEach((c) => {
      const ok = (!team || c.dataset.teamOf === team) && (!q || c.dataset.name.includes(q));
      c.hidden = !ok;
      if (ok) shown += 1;
    });
    if (empty) empty.hidden = shown > 0;
  };
  find?.addEventListener("input", apply);
  const btn = filter?.querySelector(".om-btn");
  btn?.addEventListener("click", () => { const on = !filter.classList.contains("is-open"); filter.classList.toggle("is-open", on); btn.setAttribute("aria-expanded", String(on)); });
  filter?.querySelectorAll("[data-team]").forEach((b) => b.addEventListener("click", () => {
    team = b.dataset.team;
    filter.querySelectorAll("[data-team]").forEach((x) => x.classList.toggle("is-on", x === b));
    if (label) label.textContent = team ? b.textContent : "Team";
    filter.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    apply();
  }));
  document.addEventListener("click", (e) => { if (filter && !filter.contains(e.target)) filter.classList.remove("is-open"); });
})();
