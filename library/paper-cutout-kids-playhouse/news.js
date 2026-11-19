// News list — pressing a category pill keeps only that category’s rows (the original reloads the page — here it filters in place)
(() => {
  const pills = [...document.querySelectorAll(".topics-category .j-pill")];
  const rows = [...document.querySelectorAll(".topics-list .news-item")];
  pills.forEach((p) => p.addEventListener("click", () => {
    pills.forEach((q) => q.classList.toggle("-on", q === p));
    rows.forEach((r) => (r.hidden = p.dataset.cat !== "all" && r.dataset.cat !== p.dataset.cat));
  }));
})();
