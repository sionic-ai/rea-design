// Page turn · phone contents — the cell jumping of the turn is handled by the lens-trail-page part. Here it only decides when to turn and makes the next page open as “entering”.
(() => {
  const app = document.querySelector('[data-fx~="lens-trail-page"]');
  if (!app) return;
  const KEY = "ai-swap";
  const opts = app.getAttribute("data-fx-lens-trail-page") || "";
  const enterAs = (swap) => app.setAttribute("data-fx-lens-trail-page", swap ? `${opts}; enter: swap` : opts);

  // If cells came over scattered from the previous page, use entering (.35s) instead of the first open (.7s) — set the options before the parts attach (before DOMContentLoaded)
  if (sessionStorage.getItem(KEY)) {
    sessionStorage.removeItem(KEY);
    enterAs(true);
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank") return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !url.pathname.endsWith(".html")) return;
    if (!app.classList.contains("is-fx-gl")) return;
    e.preventDefault();
    if (app.dataset.leaving) return;
    app.dataset.leaving = "1";
    closeIndex();
    app.addEventListener("fx:left", () => {
      sessionStorage.setItem(KEY, "1");
      location.href = url.href;
    }, { once: true });
    app.dispatchEvent(new CustomEvent("fx:leave"));
  });

  // Returning from cache with the back button leaves the cells scattered as they were — reattach the parts and gather them with the entrance
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    delete app.dataset.leaving;
    sessionStorage.removeItem(KEY);
    enterAs(true);
    app.setAttribute("data-fx", "");
    requestAnimationFrame(() => app.setAttribute("data-fx", "lens-trail-page"));
  });

  // Phone index — the Index button becomes a pressed strip and the plate covers the screen
  const btn = document.querySelector(".ai-toggle button");
  const nav = document.querySelector(".ai-nav");
  function setIndex(open) {
    if (!btn || !nav) return;
    nav.toggleAttribute("data-open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-pressed", String(open));
    document.documentElement.classList.toggle("is-index-open", open);
  }
  function closeIndex() { if (nav?.hasAttribute("data-open")) setIndex(false); }
  btn?.addEventListener("click", () => setIndex(!nav.hasAttribute("data-open")));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeIndex(); });
})();
