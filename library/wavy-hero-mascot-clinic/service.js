// Clinic tabs — as in the original, the button area of the pressed tab (.7s appear) and the panel below (.7s 20px rise) switch together
(() => {
  const btns = document.querySelectorAll(".me-sv-tab button");
  btns.forEach((b) => {
    b.addEventListener("click", () => {
      const key = b.dataset.tab;
      btns.forEach((x) => { const on = x === b; x.classList.toggle("is-active", on); x.setAttribute("aria-selected", on ? "true" : "false"); });
      document.querySelectorAll("[data-tabmenu]").forEach((m) => m.classList.toggle("is-active", m.dataset.tabmenu === key));
      document.querySelectorAll("[data-tabpanel]").forEach((p) => p.classList.toggle("is-active", p.dataset.tabpanel === key));
    });
  });
})();
