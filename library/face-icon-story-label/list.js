// Work list — pressing a category tag keeps only that category (original CategoryList: hidden immediately with v-show, no transition)
(() => {
  const btns = [...document.querySelectorAll(".nm-cats__btn")];
  const items = [...document.querySelectorAll(".nm-works__item")];
  btns.forEach((b) => b.addEventListener("click", () => {
    const cat = b.dataset.cat;
    btns.forEach((x) => x.classList.toggle("is-selected", x === b));
    items.forEach((li) => { li.hidden = cat !== "all" && !li.dataset.cats.split(" ").includes(cat); });
  }));
})();
