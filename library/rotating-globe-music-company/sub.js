// Work — press the Category pulldown and the panel opens to content height and the arrow flips. Picking one leaves only that category’s cards and closes it (original data-show)
(() => {
  const pull = document.querySelector(".ks-pull");
  if (!pull) return;
  const current = pull.querySelector(".ks-pull__current");
  const set = (open) => pull.setAttribute("data-open", String(open));
  current.addEventListener("click", () => set(pull.getAttribute("data-open") !== "true"));
  document.addEventListener("click", (e) => !pull.contains(e.target) && set(false));
  pull.querySelectorAll("[data-filter]").forEach((b) => b.addEventListener("click", () => {
    const f = b.dataset.filter;
    current.textContent = b.textContent;
    document.querySelectorAll(".ks-card[data-cat]").forEach((c) => c.setAttribute("data-show", String(f === "all" || c.dataset.cat === f)));
    set(false);
    window.ScrollTrigger?.refresh();
  }));
})();
