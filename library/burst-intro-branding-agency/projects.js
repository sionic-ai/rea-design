// Work list — pressing a category pill swaps in that category’s grid group (original projects-hero__slider: the old group slides away 60px and vanishes in .3s)
(() => {
  const buttons = [...document.querySelectorAll(".pj-filter")];
  const sets = [...document.querySelectorAll(".pj-set")];
  buttons.forEach((b) => b.addEventListener("click", () => {
    if (b.classList.contains("is-active")) return;
    buttons.forEach((x) => { const on = x === b; x.classList.toggle("is-active", on); x.setAttribute("aria-pressed", String(on)); });
    sets.forEach((s) => s.classList.toggle("pj-set--active", s.dataset.cat === b.dataset.cat));
  }));
})();
