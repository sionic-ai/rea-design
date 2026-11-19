// Sub pages — once everything has loaded the header appears in its light type over 1s, and when the footer (photo mosaic) reaches 25% of the screen it turns dark. The category row is dragged sideways with the mouse (original mousedragscrollable)
(() => {
  const header = document.querySelector(".n-header");
  const on = () => header.classList.add("is-active", "is-light");
  if (document.readyState === "complete") on(); else addEventListener("load", on);
  if (innerWidth > 1024) ScrollTrigger.create({ trigger: ".n-footer", start: "top 25%", toggleClass: { targets: header, className: "is-dark" } });
  document.querySelectorAll(".n-cats__items, .n-ncats__items").forEach((el) => {
    let down = false, x = 0, left = 0, moved = false;
    el.addEventListener("mousedown", (e) => { down = true; moved = false; x = e.clientX; left = el.scrollLeft; e.preventDefault(); });
    addEventListener("mousemove", (e) => { if (!down) return; const dx = x - e.clientX; if (dx) moved = true; el.scrollLeft = left + dx; });
    addEventListener("mouseup", () => { down = false; });
    el.addEventListener("click", (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);
  });
})();
