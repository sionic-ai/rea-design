// News list: filter pills. The original goes to a different address per branch, but here it filters by tag on the same page
(() => {
  const btns = [...document.querySelectorAll(".nl__filter")];
  const items = [...document.querySelectorAll(".nl__grid li")];
  btns.forEach((b) => b.addEventListener("click", () => {
    btns.forEach((x) => { x.classList.toggle("is-active", x === b); x.setAttribute("aria-selected", String(x === b)); });
    const f = b.dataset.filter;
    items.forEach((li) => { li.hidden = f !== "all" && li.dataset.tag !== f; });
    ScrollTrigger.refresh();
  }));
})();
