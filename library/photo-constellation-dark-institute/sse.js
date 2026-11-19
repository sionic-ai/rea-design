// Article collection: pressing the Choose button raises the topic picker panel in .6s
(() => {
  document.querySelectorAll(".gl-filter").forEach((f) => {
    f.querySelector(".gl-filter-btn")?.addEventListener("click", (e) => { e.stopPropagation(); f.classList.toggle("open"); });
    document.addEventListener("click", (e) => { if (!f.contains(e.target)) f.classList.remove("open"); });
  });
})();
