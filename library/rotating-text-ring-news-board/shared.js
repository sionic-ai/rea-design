// Phone menu — in the original the menu links go to another document, so the overlay closes by itself. The copy’s links are in-document spots, so pressing one closes it
(() => {
  const nav = document.querySelector(".ab-nav");
  const burger = nav?.querySelector(".ab-burger");
  if (!burger) return;
  const set = (open) => {
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
  };
  burger.addEventListener("click", () => set(!nav.classList.contains("is-open")));
  nav.querySelectorAll(".ab-nav__link").forEach((a) => a.addEventListener("click", () => set(false)));
  addEventListener("keydown", (e) => e.key === "Escape" && set(false));
})();
