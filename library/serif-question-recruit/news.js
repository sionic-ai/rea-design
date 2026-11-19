/* Topic category: the original uses a different address per category (/topics/category/ <Name>) moves on to — here ?cat= Filters the same screen with a single one (body blurs for .35s then returns) */
LH.page("news", (box) => {
  const links = [...box.querySelectorAll("[data-cats] a")];
  const items = [...box.querySelectorAll("[data-news] > article")];
  const empty = box.querySelector("[data-news-empty]");
  const main = box.querySelector(".news__main");
  const crumb = box.querySelector(".crumb li[aria-current]");
  const crumbBase = crumb.textContent;
  let timer = 0;
  const apply = (cat) => {
    links.forEach((a) => a.toggleAttribute("aria-current", a.dataset.cat === cat));
    let shown = 0;
    items.forEach((it) => { const on = cat === "all" || it.dataset.cat === cat; it.hidden = !on; shown += on; });
    empty.hidden = shown > 0;
    const label = links.find((a) => a.dataset.cat === cat);
    crumb.textContent = cat === "all" ? crumbBase : label.textContent.trim();
  };
  apply(new URLSearchParams(location.search).get("cat") || "all");
  const pick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const cat = e.currentTarget.dataset.cat;
    history.replaceState(history.state, "", cat === "all" ? "news.html" : "news.html?cat=" + cat);
    if (LH.reduce) return apply(cat);
    main.classList.add("is-out");
    clearTimeout(timer);
    timer = setTimeout(() => { apply(cat); main.classList.remove("is-out"); }, 350);
  };
  links.forEach((a) => a.addEventListener("click", pick));
  return () => { clearTimeout(timer); links.forEach((a) => a.removeEventListener("click", pick)); };
});
