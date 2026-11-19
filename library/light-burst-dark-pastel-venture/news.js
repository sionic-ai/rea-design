// News list: pressing a category pill keeps only that category’s cards (the original uses a separate URL per category — here we filter within a single page)
(() => {
  const links = [...document.querySelectorAll(".ec-cat a")];
  const items = [...document.querySelectorAll(".ec-list__li")];
  links.forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    links.forEach((l) => l.classList.toggle("is-active", l === a));
    items.forEach((it) => it.classList.toggle("is-hidden", a.dataset.cat !== "all" && it.dataset.cat !== a.dataset.cat));
    ScrollTrigger.refresh();
  }));
})();
