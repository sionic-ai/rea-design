// Header row mega menu (opens on mouse hover, closes .15s after leaving — so it doesn’t close while moving to the menu) and the phone menu
(() => {
  const items = [...document.querySelectorAll(".ak-nav__item[data-menu]")];
  let closeTimer = 0;
  const close = (except) => items.forEach((it) => {
    if (it === except) return;
    it.removeAttribute("data-open");
    it.querySelector(".ak-nav__link")?.setAttribute("aria-expanded", "false");
  });
  const open = (it) => {
    clearTimeout(closeTimer);
    close(it);
    it.setAttribute("data-open", "");
    it.querySelector(".ak-nav__link")?.setAttribute("aria-expanded", "true");
  };
  items.forEach((it) => {
    it.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") open(it); });
    it.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") closeTimer = setTimeout(() => close(), 150); });
    it.querySelector(".ak-nav__link")?.addEventListener("click", () => (it.hasAttribute("data-open") ? close() : open(it)));
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".ak-nav__item[data-menu]")) close(); });

  const sheet = document.querySelector(".ak-mobile");
  const burger = document.querySelector(".ak-nav__burger");
  const setSheet = (on) => {
    if (!sheet) return;
    sheet.hidden = !on;
    burger?.setAttribute("aria-expanded", String(on));
  };
  burger?.addEventListener("click", () => setSheet(sheet.hidden));
  sheet?.querySelector(".ak-mobile__close")?.addEventListener("click", () => setSheet(false));
  sheet?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setSheet(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") { close(); setSheet(false); } });
})();
