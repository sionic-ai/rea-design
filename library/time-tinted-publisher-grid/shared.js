// Common to all pages — picks a two-color combo by opening time (morning 6~12 · day 12~17 · night), phone hamburger menu, PAGE TOP. Overflowing text-line marquee is the overflow-marquee-line part
(() => {
  const h = new Date().getHours();
  document.documentElement.dataset.time = h >= 6 && h < 12 ? "morning" : h >= 12 && h < 17 ? "noon" : "night";

  const btn = document.querySelector(".yv-head__button"), nav = document.querySelector(".yv-head__nav");
  btn?.addEventListener("click", () => {
    const on = nav.classList.toggle("is-active");
    btn.classList.toggle("is-active", on);
    btn.setAttribute("aria-expanded", on);
  });

  document.querySelectorAll(".yv-pagetop").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }));
})();
