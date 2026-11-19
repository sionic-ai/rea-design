// Filter: the original reopens a same-type list at a category URL — here it filters within a single page
SL.page("works", (root) => {
  const links = root.querySelectorAll("[data-filter] a");
  links.forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    links.forEach((l) => l.classList.toggle("is-current", l === a));
    root.querySelectorAll("[data-tags]").forEach((li) => li.classList.toggle("is-hidden", a.dataset.f !== "all" && !li.dataset.tags.split(" ").includes(a.dataset.f)));
    ScrollTrigger.refresh();
  }));
});
