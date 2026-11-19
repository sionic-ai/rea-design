// Release the hiding after the reveal part (fx-core attaches on DOMContentLoaded) has set the opacity
(() => {
  const ready = () => document.documentElement.classList.add("ts-ready");
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", ready, { once: true });
  else queueMicrotask(ready);
})();

/* Trip list drawer — pressing MENU darkens the background and the right panel slides in over .3s. It closes via the dark overlay · × · Esc · list links */
(() => {
  const drawer = document.getElementById("ts-drawer");
  const btn = document.querySelector(".ts-menu-btn");
  if (!drawer || !btn) return;
  const set = (on) => {
    drawer.classList.toggle("is-open", on);
    drawer.setAttribute("aria-hidden", String(!on));
    btn.setAttribute("aria-expanded", String(on));
  };
  btn.addEventListener("click", () => set(!drawer.classList.contains("is-open")));
  drawer.querySelectorAll("[data-close], .ts-drawer__list a").forEach((el) => el.addEventListener("click", () => set(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
})();
