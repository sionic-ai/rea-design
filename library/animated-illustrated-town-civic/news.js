// Filter chips — the chosen chip gets a border · dot fill (radio is one, tags are many)
(() => {
  document.querySelectorAll(".nw-chip input").forEach((inp) => inp.addEventListener("change", () => {
    document.querySelectorAll(`.nw-chip input[name="${inp.name}"]`).forEach((o) => o.closest(".nw-chip").classList.toggle("is-check", o.checked));
    if (!inp.name) inp.closest(".nw-chip").classList.toggle("is-check", inp.checked);
  }));
  document.querySelector(".nw-search__reset").addEventListener("click", () => document.querySelectorAll(".nw-chip").forEach((c, i) => c.classList.toggle("is-check", i === 0)));
})();
