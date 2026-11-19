// Drawer opened with the circular menu button — cover and panel enter together over .4s, and close via the cover, close button, or Esc
(() => {
  const drawer = document.querySelector(".gn-drawer");
  const opener = document.querySelector("[data-gn-open]");
  if (!drawer || !opener) return;
  const set = (open) => {
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", String(!open));
    opener.setAttribute("aria-expanded", String(open));
    if (open) drawer.querySelector("a")?.focus({ preventScroll: true });
    else opener.focus({ preventScroll: true });
  };
  opener.addEventListener("click", () => set(true));
  drawer.querySelectorAll("[data-gn-close]").forEach((b) => b.addEventListener("click", () => set(false)));
  drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer.classList.contains("is-open")) set(false); });
})();

// Links to pages within the same site fade the current page lightly for .3s before navigating
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname || !/\.html$/.test(url.pathname)) return;
    e.preventDefault();
    document.body.classList.add("is-leaving");
    setTimeout(() => { location.href = url.href; }, 300);
  });
  addEventListener("pageshow", () => document.body.classList.remove("is-leaving"));
})();
