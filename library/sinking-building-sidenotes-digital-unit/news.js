// News list Load more — in the original, pressing it fetches the next rows (about .39s) and appends them to the end of the list (the button is pushed below), and new rows brighten in .5s.
// The loading gap is a placeholder, so treat it as waiting
(() => {
  const btn = document.querySelector(".sp-moreload");
  const list = document.querySelector(".sp-news__list");
  if (!btn || !list) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  btn.addEventListener("click", () => {
    setTimeout(() => {
      [...list.children].slice(0, 5).forEach((li) => {
        const row = li.cloneNode(true);
        row.setAttribute("data-fx", "studio-appear");
        row.setAttribute("data-fx-studio-appear", "look: fade; at: 100");
        row.style.cssText = "--fx-dur: .5s; --fx-ease: cubic-bezier(0.4,0.4,0,1)";
        list.append(row);
      });
    }, reduce ? 0 : 390);
  });
})();
