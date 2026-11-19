// Common to all pages: draws the placeholder symbols and sets aria-current on the current page’s menu item.
// The original is static documents fetched separately per page so there is no page transition effect — here too it is left as normal navigation.
(() => {
  const mark = '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">' +
    '<g stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
    '<path d="M24 24 L24 9"/><path d="M24 24 L39 18"/><path d="M24 24 L35 38"/><path d="M24 24 L9 31"/></g>' +
    '<g fill="currentColor"><rect x="19" y="19" width="10" height="10" rx="3"/>' +
    '<circle cx="24" cy="8" r="4"/><circle cx="40" cy="17.5" r="5"/><circle cx="36" cy="39" r="3.5"/><circle cx="8" cy="31.5" r="4.5"/></g></svg>';
  document.querySelectorAll("[data-logo]").forEach((el) => { el.innerHTML = mark; });

  const page = document.body.dataset.page;
  document.querySelectorAll(`[data-nav="${page}"]`).forEach((a) => a.setAttribute("aria-current", "page"));
})();
