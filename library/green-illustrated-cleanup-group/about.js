/* Report list — the original has one cell per year (23 cells, flowing in five rows). PDF icon + year name placeholder */
(() => {
  const list = document.querySelector(".gb-report__list");
  if (!list) return;
  const icon = '<svg viewBox="0 0 19 23" aria-hidden="true"><path d="M1.5 4.5 5 1h11.5a1.5 1.5 0 0 1 1.5 1.5v18a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 1 20.5V5z" fill="none" stroke="currentColor" stroke-width="2"/><text x="9.5" y="15" font-size="5.5" text-anchor="middle" fill="currentColor">PDF</text></svg>';
  let html = "";
  for (let i = 0; i < 23; i++) html += `<li><a href="#report">${icon}<span>Year 0000</span></a></li>`;
  list.innerHTML = html;
})();
