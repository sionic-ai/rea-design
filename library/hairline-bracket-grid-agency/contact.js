// Booking cells: pressing a date or time cell turns only that cell red (.2s). Next Steps removes the two pick cells from the document and inserts an input panel two cells wide —
// The ‹Picked date · time› line under the first cell lights up one beat late, at .2s after it is placed (original 136ms). ‹Back› is reversed
(() => {
  const book = document.querySelector(".rc-book");
  if (!book) return;
  book.addEventListener("click", (e) => {
    const b = e.target.closest(".rc-book__grid > button");
    if (!b) return;
    const group = b.parentElement.dataset.group;
    book.querySelectorAll(`.rc-book__grid[data-group="${group}"] > button`).forEach((x) => x.toggleAttribute("data-active", x === b));
  });
  const tpl = document.getElementById("rc-book-form");
  const slot = book.querySelector(".rc-book__slot");
  let picks = [], form = null;
  book.addEventListener("click", (e) => {
    if (e.target.closest("[data-next]") && tpl) {
      picks = [...book.querySelectorAll('[data-step="pick"]')];
      form = tpl.content.firstElementChild.cloneNode(true);
      picks[0].before(form);
      picks.forEach((p) => p.remove());
      setTimeout(() => slot?.setAttribute("data-visible", "true"), 15);
      form.addEventListener("submit", (ev) => ev.preventDefault());
    } else if (e.target.closest("[data-back]") && form) {
      picks.forEach((p) => form.before(p));
      form.remove();
      form = null;
      slot?.setAttribute("data-visible", "false");
    }
  });
})();
