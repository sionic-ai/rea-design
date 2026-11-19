// Table of contents fold: like the original TOC plugin, it swaps ”Close/Open” while hiding and showing the list with jQuery hide·show("fast") — folds and unfolds height, width and opacity together with a 200ms swing
(() => {
  const toc = document.querySelector(".ar-toc");
  const $ = window.jQuery;
  if (!toc || !$) return;
  const list = toc.querySelector(".ar-toc__list");
  const label = toc.querySelector(".ar-toc__btn span");
  toc.querySelector(".ar-toc__btn").addEventListener("click", () => {
    const open = label.textContent === "Open";
    label.textContent = open ? "Close" : "Open";
    toc.classList.toggle("is-contracted", !open);
    $(list)[open ? "show" : "hide"]("fast");
  });
})();
