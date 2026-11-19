// Careers — department picker filters job posting groups (the original is a same-shaped panel drawn by an external recruiting widget)
(() => {
  const sel = document.querySelector('[data-job-filter="dept"]');
  sel?.addEventListener("change", () => {
    document.querySelectorAll("[data-dept]").forEach((d) => { d.hidden = !!sel.value && d.dataset.dept !== sel.value; });
    ScrollTrigger.refresh();
  });
})();
