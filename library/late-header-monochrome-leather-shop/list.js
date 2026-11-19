// News category: the original goes to a different URL per category (/tagged/…), but the copy moves the dot and filters the list within a single page.
(() => {
  const links = document.querySelectorAll(".news-cat__item a");
  const items = [...document.querySelectorAll(".news__item")];
  links.forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      links.forEach((l) => l.parentElement.classList.toggle("is-active", l === a));
      const cat = a.dataset.cat;
      let first = true;
      items.forEach((it) => {
        const show = cat === "all" || it.dataset.cat === cat;
        it.hidden = !show;
        it.classList.toggle("is-first", show && first);
        if (show) first = false;
      });
    })
  );
})();
