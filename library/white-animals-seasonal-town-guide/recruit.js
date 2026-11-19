// Job search: keep only the rows that match everything picked across the three filter groups (job type · industry · employment type), then raise the remaining rows again at .04s intervals while scrolling back to the list top (the original swaps the same spot via fetch).
(() => {
  const groups = [...document.querySelectorAll(".jb-side__list")];
  const list = document.querySelector(".jb-list");
  const items = [...list.querySelectorAll(".jb-item")];
  const label = (a) => a.firstChild.textContent.trim();
  const apply = () => {
    const picks = groups.map((g) => g.querySelector(".is-current .jb-side__link")).filter((a, i) => a && a !== groups[i].querySelector(".jb-side__link")).map(label);
    items.forEach((it) => {
      const cats = [...it.querySelectorAll(".jb-item__cat")].map((c) => c.textContent.trim());
      it.classList.toggle("is-hidden", !picks.every((p) => cats.includes(p)));
    });
    SM.relist(items, list);
  };
  groups.forEach((g) => g.addEventListener("click", (e) => {
    const a = e.target.closest(".jb-side__link");
    if (!a) return;
    e.preventDefault();
    g.querySelectorAll(".jb-side__item").forEach((li) => li.classList.toggle("is-current", li === a.parentElement));
    apply();
  }));
})();
