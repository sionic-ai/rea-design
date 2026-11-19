// News category tabs — the original loads each category from a different URL (/news/category/goods), but since the layout is the same, I filter within one page and only change the URL.
(() => {
  document.querySelectorAll(".bb-ttl__bg").forEach((el) => (el.innerHTML = BB.splash(+el.dataset.splash, el.dataset.splashColor, 498, 298 * 0.77)));

  const links = [...document.querySelectorAll(".category-link")];
  const items = [...document.querySelectorAll(".list .c-news-item")];
  const apply = (cat) => {
    links.forEach((a) => {
      const on = a.dataset.cat === cat;
      a.parentElement.classList.toggle("is-current", on);
      on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
    });
    items.forEach((it) => (it.hidden = cat !== "all" && it.dataset.cat !== cat));
  };
  links.forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      apply(a.dataset.cat);
      history.replaceState(null, "", a.dataset.cat === "all" ? "news.html" : `news.html?cat=${a.dataset.cat}`);
    })
  );
  apply(new URLSearchParams(location.search).get("cat") || "all");
})();
