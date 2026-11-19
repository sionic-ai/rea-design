// Performance calendar — filter fold, toggle buttons, favorite heart
(() => {
  document.querySelectorAll(".c-filter__btn").forEach((b) => b.addEventListener("click", () => b.setAttribute("aria-expanded", String(b.getAttribute("aria-expanded") !== "true"))));
  document.querySelectorAll(".c-switch").forEach((b) => b.addEventListener("click", () => b.setAttribute("aria-checked", String(b.getAttribute("aria-checked") !== "true"))));
  // Favorite: pressing fills the heart immediately, and like when the original opens a login window, row background hover stays off until release
  document.querySelectorAll(".c-ev__fav").forEach((b) => b.addEventListener("click", () => {
    b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
    const row = b.closest(".c-ev");
    row.classList.add("is-quiet");
    row.addEventListener("mouseleave", () => row.classList.remove("is-quiet"), { once: true });
  }));
})();
