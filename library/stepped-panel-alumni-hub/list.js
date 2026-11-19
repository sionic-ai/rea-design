// Department picker: the light moves to the pressed cell, and on phones the collapsing select box closes and shows the chosen name
(() => {
  const filter = document.querySelector(".filter");
  const current = filter.querySelector(".filter-current span");
  filter.querySelector(".filter-current").addEventListener("click", () => filter.classList.toggle("is-open"));
  filter.querySelectorAll(".filter-list li").forEach((li) => li.addEventListener("click", () => {
    filter.querySelector(".filter-list .active")?.classList.remove("active");
    li.classList.add("active");
    current.textContent = li.textContent.trim();
    filter.classList.remove("is-open");
  }));
})();
