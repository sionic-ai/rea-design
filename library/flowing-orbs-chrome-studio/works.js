// Work — view toggle pill: grid (big cards) ↔ list (rows). The handle crosses in .4s and the view changes immediately
(() => {
  const box = document.querySelector("[data-view]");
  if (!box) return;
  const btns = [...box.querySelectorAll(".wk__toggle button")];
  btns.forEach((b) => b.addEventListener("click", () => {
    box.dataset.view = b.dataset.view;
    btns.forEach((x) => { x.classList.toggle("is-on", x === b); x.setAttribute("aria-selected", String(x === b)); });
    window.ScrollTrigger?.refresh();
    window.dvLenis?.resize();
  }));
})();
