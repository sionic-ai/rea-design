// Header row — search panel open/close and phone hamburger menu (when opened the band turns white and body scroll is locked). They close each other in the same order as the original globalHeader.
(() => {
  const band = document.querySelector(".mf-band");
  const trigger = document.querySelector(".mf-trigger");
  const spmenu = document.querySelector(".mf-spmenu");
  const searchLink = document.querySelector(".mf-search__link");
  const searchPanel = document.querySelector(".mf-search__panel");
  if (!band || !trigger || !spmenu || !searchLink || !searchPanel) return;

  const setMenu = (open) => {
    trigger.setAttribute("aria-expanded", String(open));
    trigger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    spmenu.classList.toggle("is-active", open);
    band.classList.toggle("is-open", open);
    document.body.classList.toggle("is-locked", open);
  };
  const setSearch = (open) => {
    searchPanel.classList.toggle("is-active", open);
    searchLink.setAttribute("aria-expanded", String(open));
  };

  trigger.addEventListener("click", () => {
    const open = trigger.getAttribute("aria-expanded") !== "true";
    setMenu(open);
    if (open) setSearch(false);
  });
  matchMedia("(min-width: 992px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  searchLink.addEventListener("click", (e) => {
    e.preventDefault();
    const open = !searchPanel.classList.contains("is-active");
    setSearch(open);
    if (open) {
      setMenu(false);
      searchPanel.querySelector("input")?.focus({ preventScroll: true });
    }
  });
  document.addEventListener("click", (e) => {
    if (searchPanel.classList.contains("is-active") && !searchPanel.contains(e.target) && !searchLink.contains(e.target)) setSearch(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (searchPanel.classList.contains("is-active")) { setSearch(false); searchLink.focus(); }
    if (trigger.getAttribute("aria-expanded") === "true") { setMenu(false); trigger.focus(); }
  });
})();
