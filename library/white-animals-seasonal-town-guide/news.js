// Reading list: pressing a category bar keeps only that group without changing the page, the remaining cards rise again at .04s intervals and the view scrolls smoothly up to the top of the list (the original swaps the same area via fetch).
(() => {
  const tabs = [...document.querySelectorAll(".sm-cat__item")];
  const list = document.querySelector(".nl__list");
  const items = [...list.querySelectorAll(".nl__item")];
  tabs.forEach((tab) => tab.querySelector("button").addEventListener("click", (e) => {
    const f = e.currentTarget.dataset.filter;
    tabs.forEach((t) => t.classList.toggle("is-current", t === tab));
    items.forEach((it) => it.classList.toggle("is-hidden", f ? it.dataset.cat !== f : false));
    SM.relist(items, list);
  }));
})();
