/* Top bar hamburger — opens and closes the section list. Pressing a section link closes it */
(() => {
  const nav = document.querySelector(".tv-nav");
  const btn = nav?.querySelector(".tv-nav__btn");
  if (!btn) return;
  const set = (open) => { nav.classList.toggle("is-open", open); btn.setAttribute("aria-expanded", String(open)); btn.setAttribute("aria-label", open ? "Close section list" : "Open section list"); };
  btn.addEventListener("click", () => set(!nav.classList.contains("is-open")));
  nav.querySelectorAll(".tv-nav__panel a").forEach((a) => a.addEventListener("click", () => set(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
})();
