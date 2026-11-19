// Work list — the Choose work button opens a row of industry tags, and clicking a tag leaves only that industry’s cards
(() => {
  const box = document.querySelector(".d-filter");
  if (!box) return;
  const btn = box.querySelector("[data-filter-toggle]");
  btn.addEventListener("click", () => btn.setAttribute("aria-expanded", String(box.classList.toggle("is-open"))));
  const cards = [...document.querySelectorAll(".d-wgrid .d-card-wrap")];
  box.querySelectorAll("[data-filter]").forEach((t, i, all) => t.addEventListener("click", () => {
    all.forEach((o) => o.setAttribute("aria-pressed", String(o === t)));
    const k = t.dataset.filter;
    cards.forEach((c, n) => c.classList.toggle("is-out", k !== "all" && "abcde"[n % 5] !== k));
  }));
})();
