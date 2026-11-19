// Entry — Q&A toggle (original InternshipQAAcordion: the cross rotates 90° with .3s ease-in-out and the answer expands)
(() => {
  document.querySelectorAll(".rc__q").forEach((q) => q.addEventListener("click", () => {
    q.setAttribute("aria-expanded", String(q.getAttribute("aria-expanded") !== "true"));
  }));
})();
