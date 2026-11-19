// Category pill — each category has its own URL as in the original (news.html?tag=important ← /news/tags/important). The same page shows only the category in the URL,
// If a category has no cards, show ‹COMING SOON› (the slot of the recorded sub-page ‹Important Notice›). Also accepts the old URL type news.html#important
(() => {
  const tabs = [...document.querySelectorAll(".nw-tabs a")];
  const cards = [...document.querySelectorAll(".nw-card")];
  const empty = document.querySelector(".nw-empty");
  let tag = new URLSearchParams(location.search).get("tag") || location.hash.slice(1) || "all";
  if (!tabs.some((t) => t.dataset.tag === tag)) tag = "all";
  tabs.forEach((t) => (t.dataset.tag === tag ? t.setAttribute("aria-current", "page") : t.removeAttribute("aria-current")));
  let n = 0;
  cards.forEach((c) => {
    const on = tag === "all" || c.dataset.tags.split(" ").includes(tag);
    c.hidden = !on;
    n += on;
  });
  if (empty) empty.hidden = n > 0;
})();
