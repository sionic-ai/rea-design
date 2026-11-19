// Two route diagrams — four start cells gather into one end cell by arrows (cell count and order of the original diagram)
(() => {
  const ROUTES = {
    train: [["1", "Your departure station 1 here", "High-speed train", "About 00 min"], ["2", "Your departure station 2 here", "High-speed train", "About 00 min"], ["3", "Your departure station 3 here", "Express → Transfer", "About 0 hours"], ["4", "Your departure station 4 here", "Express → Transfer", "About 0 hours"]],
    car: [["1", "Your gateway 1 here", "Highway", "About 00 min"], ["2", "Your gateway 2 here", "National highway", "About 00 min"], ["3", "Your gateway 3 here", "Expressway → national road", "About 0 hours"], ["4", "Your gateway 4 here", "National highway", "About 0 hours"]],
  };
  document.querySelectorAll("[data-route]").forEach((el) => {
    const rows = ROUTES[el.dataset.route];
    el.innerHTML = rows.map(([tone, from, via, time], i) => `<span class="from" data-tone="${tone}" style="grid-row:${i + 1}">${from}</span><span class="via" style="grid-row:${i + 1}">${via}<small>${time}</small></span>`).join("") + `<span class="to">Your destination here</span>`;
  });
})();
