// News filter: pressing ALL·NEWS filters by tag on the same page (the original reopens a page of the same type at /tagged/news)
(() => {
  const links = document.querySelectorAll("[data-filter]");
  const items = document.querySelectorAll(".nw-item");
  const apply = (tag) => {
    links.forEach((a) => a.classList.toggle("is-current", a.dataset.filter === tag));
    items.forEach((it) => {
      const show = tag === "all" || (it.dataset.tags || "").split(" ").includes(tag);
      it.classList.toggle("is-hidden", !show);
      if (show) { it.classList.remove("is-in"); requestAnimationFrame(() => it.classList.add("is-in")); }
    });
    ScrollTrigger.refresh();
  };
  links.forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); apply(a.dataset.filter); }));
  if (location.hash === "#news") apply("NEWS");
})();
