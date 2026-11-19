// Phone menu — like the original STUDIO modal, tapping menu text goes to that section and closes the modal
(() => {
  const menu = document.querySelector(".st-menu");
  if (!menu) return;
  menu.addEventListener("click", (e) => {
    const link = e.target.closest(".st-menu__list a[href^='#']");
    if (link) menu.querySelector('[data-fx-part="close"]')?.click();
  });
})();
