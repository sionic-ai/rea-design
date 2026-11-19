// One post — share (device share sheet if available), copy link, and Back goes to the previous page if you came from the same site
(() => {
  const share = document.querySelector("[data-action='share']");
  const copy = document.querySelector("[data-action='copy-link']");
  share?.addEventListener("click", () => {
    if (navigator.share) navigator.share({ title: document.title, url: location.href }).catch(() => {});
    else copy?.click();
  });
  copy?.addEventListener("click", () => {
    navigator.clipboard?.writeText(location.href).catch(() => {});
    copy.setAttribute("aria-label", "Copied");
    setTimeout(() => copy.setAttribute("aria-label", "Copy link"), 1500);
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-back]");
    if (!b) return;
    let same = false;
    try { same = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (_) {}
    if (same && history.length > 1) { e.preventDefault(); history.back(); }
  });
})();
