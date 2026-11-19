// Category tabs — the original has a different address per category (/news/closed/), so pressing a tab opens a new page. The copy uses ?cat= Opens the same section and keeps only that category
(() => {
  const cat = new URLSearchParams(location.search).get("cat") || "all";
  document.querySelectorAll(".me-nl-tab a").forEach((a) => {
    const on = a.dataset.cat === cat;
    a.classList.toggle("is-current", on);
    if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  if (cat !== "all") document.querySelectorAll(".me-nl-item").forEach((it) => { it.hidden = it.dataset.cat !== cat; });
})();
