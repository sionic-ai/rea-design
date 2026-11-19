/* Shared by subpages — button slot fill, tabs */
(() => {
  document.querySelectorAll("[data-btn]").forEach((el) => { const [l, h, c] = el.dataset.btn.split("|"); el.outerHTML = window.miBtn(l, h || "#", c || ""); });
  document.querySelectorAll(".mi-tabs").forEach((tabs) => {
    const items = [...tabs.children];
    items.forEach((t) => {
      const go = () => items.forEach((x) => x.classList.toggle("is-on", x === t));
      t.addEventListener("click", go);
      t.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });
  });
  addEventListener("load", () => ScrollTrigger.refresh());
})();
