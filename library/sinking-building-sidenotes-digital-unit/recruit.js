// Careers — the FAQ starts expanded (as in the original) and collapses when pressed
(() => {
  document.querySelectorAll(".sp-qa__q").forEach((q) => q.addEventListener("click", () => {
    const li = q.closest(".sp-qa");
    q.setAttribute("aria-expanded", String(li.classList.toggle("is-open")));
  }));
})();
