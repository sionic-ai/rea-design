// The original’s category pill is a link to a per-category list page — here there is only one recorded page, so it filters in place
(() => {
  const terms = document.querySelectorAll(".nl-newshead__term");
  const items = document.querySelectorAll(".nl-newsitem");
  terms.forEach((t) => t.addEventListener("click", () => {
    terms.forEach((x) => x.classList.toggle("is-current", x === t));
    items.forEach((it) => it.classList.toggle("is-hidden", t.dataset.term !== "all" && it.dataset.term !== t.dataset.term));
    ScrollTrigger.refresh();
  }));
})();
