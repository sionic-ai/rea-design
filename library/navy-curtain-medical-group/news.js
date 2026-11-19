// News: pressing a category pill keeps only that category and sets the title to the category name (the state of the original per-category list page). Pressing the same pill again shows all.
(() => {
  const ttl = document.querySelector(".tf-catttl");
  const items = [...document.querySelectorAll(".tf-posts > li")];
  document.querySelectorAll(".tf-pills a").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    const on = !a.classList.contains("is-active");
    document.querySelectorAll(".tf-pills a").forEach((b) => b.classList.remove("is-active"));
    a.classList.toggle("is-active", on);
    items.forEach((li) => (li.hidden = on && li.dataset[a.dataset.k] !== a.dataset.v));
    ttl.textContent = on ? a.dataset.v : "All News";
    ScrollTrigger.refresh();
  }));
})();
