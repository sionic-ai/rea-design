// Shared across the site — opening and closing the phone menu drawer. Header pinning, entrance, flowing logo and review paging are handled by the motion part (fx)
(() => {
  const burgers = [...document.querySelectorAll(".ba-burger")];
  const drawer = document.getElementById("ba-drawer");
  if (!burgers.length || !drawer) return;
  const set = (open) => {
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", String(!open));
    burgers.forEach((b) => { b.setAttribute("aria-expanded", String(open)); b.setAttribute("aria-label", open ? "Close Menu" : "Open Menu"); });
  };
  burgers.forEach((b) => b.addEventListener("click", () => set(!drawer.classList.contains("is-open"))));
  drawer.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
})();
