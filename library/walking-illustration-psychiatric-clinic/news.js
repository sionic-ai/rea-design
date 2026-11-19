// News: pressing a category on the left keeps only that category’s posts and sets the title and breadcrumb to it (the original’s per-category list — notice · recruit page state).
(() => {
  const ttl = document.querySelector(".hh-catttl");
  const crumb = document.querySelector(".hh-crumb li:last-child");
  const items = [...document.querySelectorAll(".hh-posts > li")];
  const links = [...document.querySelectorAll(".hh-catlinks a")];
  const pick = (cat) => {
    links.forEach((a) => a.classList.toggle("is-current", a.dataset.cat === cat));
    items.forEach((li) => (li.hidden = !li.dataset.cats.split(" ").includes(cat)));
    ttl.textContent = cat;
    if (crumb) crumb.textContent = cat;
  };
  links.forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); pick(a.dataset.cat); }));
  pick("Notice");
})();
