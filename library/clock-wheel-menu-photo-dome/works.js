// Work list — turns the menu to ”Video” (1.18s power4.inOut) and resets the category buttons to their initial state (All)
(() => {
  document.querySelector(".mc-dial")?.dispatchEvent(new CustomEvent("fx:dial", { detail: { to: "video" } }));
  document.querySelectorAll('.mc-sub[data-sub="video"] .mc-sub__btn').forEach((b) => (b.dataset.active = String(b.dataset.filter === "all")));
})();
