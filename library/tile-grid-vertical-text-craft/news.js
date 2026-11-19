// News list — moves the chosen value into the box text (original pulldownselect)
(() => {
  document.querySelectorAll(".sc-pulldown select").forEach((s) => s.addEventListener("change", () => (s.previousElementSibling.textContent = s.selectedOptions[0].textContent)));
})();
