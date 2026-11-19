// Category tabs — keep only the chosen category’s cards (changes instantly and does not animate, like the original). Only the tab underline grows over .2s
(() => {
  const tabs = [...document.querySelectorAll(".n-tabs [data-cat]")], cards = [...document.querySelectorAll(".n-card")];
  tabs.forEach((t) => t.addEventListener("click", () => {
    tabs.forEach((o) => o.setAttribute("aria-selected", String(o === t)));
    const cat = t.dataset.cat;
    cards.forEach((c) => (c.hidden = !(cat === "all" || c.dataset.cat === cat)));
  }));
})();
