// Shared by all pages — light, dark and system skin switch, menu panel (left half on desktop, left panel on phone), search panel, cart close button, accordion.
// The original (Next app) turns the menu panel on and off at once without a cover (only the curtain fades after .4s), and page transitions also switch at once without a cover
(() => {
  const root = document.documentElement;

  // Skin switch — the original default is System (follows the OS setting)
  const KEY = "ib-theme";
  const dark = matchMedia("(prefers-color-scheme: dark)");
  const applyTheme = (mode) => {
    const isDark = mode === "dark" || (mode === "system" && dark.matches);
    if (isDark) root.dataset.theme = "dark"; else delete root.dataset.theme;
    document.querySelectorAll("[data-theme-switch] [data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
  };
  let mode = localStorage.getItem(KEY) || "system";
  applyTheme(mode);
  dark.addEventListener("change", () => applyTheme(mode));
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-theme-switch] [data-mode]");
    if (!b) return;
    mode = b.dataset.mode;
    localStorage.setItem(KEY, mode);
    applyTheme(mode);
  });

  const head = document.querySelector(".ib-head");
  const scrim = document.querySelector("[data-scrim]");
  const nav = document.querySelector("[data-nav]");
  const mmenu = document.querySelector("[data-mmenu-panel]");
  const search = document.querySelector("[data-search-panel]");
  const searchScrim = document.querySelector("[data-search-scrim]");
  const menuBtns = [...document.querySelectorAll("[data-menu]")];
  const mBtn = document.querySelector("[data-mmenu]");
  const sBtn = document.querySelector("[data-search]");

  const closeMenus = () => {
    nav?.classList.remove("is-open");
    nav?.setAttribute("aria-hidden", "true");
    nav?.querySelectorAll(".ib-nav__panel").forEach((p) => p.classList.remove("is-on"));
    mmenu?.classList.remove("is-open");
    mmenu?.setAttribute("aria-hidden", "true");
    menuBtns.forEach((b) => b.setAttribute("aria-expanded", "false"));
    mBtn?.setAttribute("aria-expanded", "false");
    scrim?.classList.remove("is-on");
    head?.classList.remove("is-menu");
  };
  const openNav = (id) => {
    closeSearch();
    const panel = document.getElementById(id);
    if (!panel || !nav) return;
    nav.querySelectorAll(".ib-nav__panel").forEach((p) => p.classList.toggle("is-on", p === panel));
    nav.classList.add("is-open");
    nav.setAttribute("aria-hidden", "false");
    menuBtns.forEach((b) => b.setAttribute("aria-expanded", String(b.dataset.menu === id)));
    scrim?.classList.add("is-on");
    head?.classList.add("is-menu");
  };
  menuBtns.forEach((b) => b.addEventListener("click", () => (b.getAttribute("aria-expanded") === "true" ? closeMenus() : openNav(b.dataset.menu))));
  mBtn?.addEventListener("click", () => {
    if (mmenu?.classList.contains("is-open")) return closeMenus();
    closeSearch();
    mmenu?.classList.add("is-open");
    mmenu?.setAttribute("aria-hidden", "false");
    mBtn.setAttribute("aria-expanded", "true");
    scrim?.classList.add("is-on");
    head?.classList.add("is-menu");
  });
  mmenu?.querySelectorAll('[role="tab"]').forEach((t, i, all) => t.addEventListener("click", () => all.forEach((x) => x.setAttribute("aria-selected", String(x === t)))));
  scrim?.addEventListener("click", closeMenus);

  function closeSearch() {
    search?.classList.remove("is-open");
    search?.setAttribute("aria-hidden", "true");
    searchScrim?.classList.remove("is-on");
    sBtn?.setAttribute("aria-expanded", "false");
  }
  sBtn?.addEventListener("click", () => {
    if (search?.classList.contains("is-open")) return closeSearch();
    closeMenus();
    search?.classList.add("is-open");
    search?.setAttribute("aria-hidden", "false");
    searchScrim?.classList.add("is-on");
    sBtn.setAttribute("aria-expanded", "true");
    setTimeout(() => search?.querySelector("input")?.focus({ preventScroll: true }), 50);
  });
  document.querySelector("[data-search-close]")?.addEventListener("click", closeSearch);
  searchScrim?.addEventListener("click", closeSearch);
  addEventListener("keydown", (e) => { if (e.key === "Escape") { closeMenus(); closeSearch(); } });

  // Close inside the cart panel presses the open/close button of the side-drawer on its behalf
  document.querySelector("[data-cart-close]")?.addEventListener("click", () => document.querySelector('.ib-cart [data-fx-part="toggle"]')?.click());

  // Accordion — height opens with the original .5s easeOutQuart and the arrow rotates in .2s (css)
  document.querySelectorAll("[data-acc]").forEach((acc) => {
    const btn = acc.querySelector("button");
    btn?.addEventListener("click", () => {
      const open = acc.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });
})();
