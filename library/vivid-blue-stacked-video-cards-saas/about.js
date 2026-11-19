// About the company — horizontal history slide (the original Framer carousel is a horizontal scroll panel + arrows, one cell at a time)
(() => {
  const view = document.querySelector("[data-py-hist-view]");
  if (!view) return;
  const btns = [...document.querySelectorAll("[data-py-hist]")];
  const step = () => { const it = view.querySelector(".py-hist__item"); return it ? it.offsetWidth + 30 : 430; };
  const sync = () => {
    const max = view.scrollWidth - view.clientWidth - 2;
    btns.forEach((b) => { b.disabled = +b.dataset.pyHist < 0 ? view.scrollLeft <= 2 : view.scrollLeft >= max; });
  };
  btns.forEach((b) => b.addEventListener("click", () => view.scrollBy({ left: +b.dataset.pyHist * step(), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })));
  view.addEventListener("scroll", sync, { passive: true });
  addEventListener("resize", sync);
  sync();
})();
