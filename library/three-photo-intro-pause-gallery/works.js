// Gallery categories — opening one branch closes the others (original data-accordion toggle)
(() => {
  const accs = [...document.querySelectorAll("[data-cat]")];
  accs.forEach((d) => d.addEventListener("toggle", () => { if (d.open) accs.forEach((o) => o !== d && (o.open = false)); }));
})();
