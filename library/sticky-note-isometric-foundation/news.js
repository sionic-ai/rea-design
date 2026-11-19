/* Notice list — the original navigates to a different page per category (/info/category/important …). The copy keeps only that category within one page, and opens it directly via the #important hash */
(() => {
  const btns = document.querySelectorAll(".p-info-cat button");
  const rows = document.querySelectorAll(".p-news-list__item[data-cat]");
  const pick = (cat) => {
    btns.forEach((b) => b.classList.toggle("is-active", b.dataset.cat === cat));
    rows.forEach((r) => r.classList.toggle("is-hidden", cat !== "all" && !r.dataset.cat.split(" ").includes(cat)));
  };
  btns.forEach((b) => b.addEventListener("click", () => { pick(b.dataset.cat); history.replaceState(null, "", `#${b.dataset.cat}`); }));
  const start = location.hash.slice(1);
  if ([...btns].some((b) => b.dataset.cat === start)) pick(start);
})();
