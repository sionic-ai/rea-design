// Section interactions — picking region tabs and store rows for participating stores, and filtering News categories. Re-attach to the new page every time the page is swapped (tz:page).
document.addEventListener("tz:page", ({ detail: { main } }) => {
  const tabs = [...main.querySelectorAll(".shops_tab")];
  tabs.forEach((t) => t.addEventListener("click", () => tabs.forEach((x) => { x.classList.toggle("is_current", x === t); x.setAttribute("aria-selected", String(x === t)); })));
  const items = [...main.querySelectorAll(".shops_item")];
  items.forEach((it) => it.querySelector(".shops_info").addEventListener("click", () => items.forEach((x) => x.classList.toggle("is_active", x === it))));
  const filters = [...main.querySelectorAll(".news_filter")];
  filters.forEach((f) => f.addEventListener("click", () => {
    filters.forEach((x) => { x.classList.toggle("is_current", x === f); x.setAttribute("aria-pressed", String(x === f)); });
    main.querySelectorAll(".news_item").forEach((n) => { n.hidden = f.dataset.cat !== "all" && n.dataset.cat !== f.dataset.cat; });
  }));
});
