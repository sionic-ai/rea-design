// Incident section — switch between map view / list view, open and close the filter button
(() => {
  const box = document.querySelector("[data-view-box]");
  document.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => {
    if (!box || box.dataset.viewBox === b.dataset.view) return;
    box.dataset.viewBox = b.dataset.view;
    document.querySelectorAll("[data-view]").forEach((o) => { const on = o === b; o.setAttribute("aria-checked", String(on)); });
    ScrollTrigger.refresh();
  }));
  document.querySelectorAll(".k-filter").forEach((f) => f.addEventListener("click", () => {
    const on = f.getAttribute("aria-expanded") !== "true";
    document.querySelectorAll(".k-filter").forEach((o) => o.setAttribute("aria-expanded", "false"));
    f.setAttribute("aria-expanded", String(on));
  }));
})();
