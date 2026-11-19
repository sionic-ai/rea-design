// Merch: choosing a season leaves only that season’s products (the original reloads the page, but this copy filters in place).
(() => {
  const items = [...document.querySelectorAll(".g-band .g-grid > div")];
  document.querySelectorAll('.g-filter input[name="season"]').forEach((r) => r.addEventListener("change", () => {
    items.forEach((it) => (it.hidden = !!r.value && it.dataset.season !== r.value));
  }));
})();
