// View projects — original c-view-switcher(projects): puts 2·4 columns into grid variables and data-projects-grid-cols
(() => {
  const box = document.querySelector("[data-en-projects]");
  if (!box) return;
  box.querySelectorAll("[data-en-pviewsw] input").forEach((i) => i.addEventListener("change", () => {
    box.style.setProperty("--pcols", i.value);
    box.dataset.pcols = i.value;
  }));
})();
