// Interaction shared by every page: header line darkening (first page only), phone menu open/close, cookie overlay.
// Brush board, drawing board, and page-turn line are handled by the motion parts (ink-rope-draw, nav-progress-line).
(() => {
  const root = document.documentElement;

  // On the home page the hero’s header row is empty and the background and logo darken until scrolled down one screen — other pages are dark from the start
  if (document.body.dataset.head === "fade") {
    const tint = () => root.style.setProperty("--site-head-a", Math.min(scrollY / innerHeight, 1).toFixed(3));
    addEventListener("scroll", tint, { passive: true });
    addEventListener("resize", tint);
    tint();
  }

  // The original waits as long as the destination weighs — About and similar switch the screen at .52s, the heavy first page at 1.32s (minus the .27s local move)
  if (document.body.dataset.head !== "fade") {
    document.querySelectorAll('[data-fx~="nav-progress-line"]').forEach((l) => l.setAttribute("data-fx-nav-progress-line", "wait: 1.05; start: 0.1"));
  }

  const menu = document.querySelector(".c-menu");
  const toggle = menu?.querySelector(".c-menu__toggle");
  const setMenu = (open) => {
    menu.classList.toggle("is-open", open);
    document.body.classList.toggle("is-menu", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    if (open) menu.querySelector(".c-menu__link")?.focus();
  };
  toggle?.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
  menu?.querySelectorAll(".c-menu__link").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && menu?.classList.contains("is-open")) setMenu(false); });

  const KEY = "site-brand-consent";
  const cookie = document.querySelector(".c-cookie");
  // Like the original, remove the whole screen — merely hiding it causes a motion where the button size changes to 0
  if (cookie) {
    if (localStorage.getItem(KEY)) cookie.remove();
    else cookie.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
      localStorage.setItem(KEY, b.dataset.consent || "1");
      cookie.remove();
    }));
  }
})();
