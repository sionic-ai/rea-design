// News: pressing a category pill keeps only that category’s rows (the original reloads the page, the copy filters in place).
(() => {
  const btns = [...document.querySelectorAll(".n-filter button")];
  const rows = [...document.querySelectorAll(".n-list li")];
  btns.forEach((b) => b.addEventListener("click", () => {
    btns.forEach((x) => x.classList.toggle("is-on", x === b));
    rows.forEach((r) => (r.hidden = !!b.dataset.f && r.dataset.cat !== b.dataset.f));
  }));
})();
