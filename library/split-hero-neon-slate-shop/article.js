// Share button — opens and closes the fallback slot (copy-link field + close) of the original share-button
(() => {
  const btn = document.querySelector(".ev-share");
  const panel = document.querySelector(".ev-share__panel");
  if (!btn || !panel) return;
  const set = (open) => { panel.hidden = !open; btn.setAttribute("aria-expanded", String(open)); };
  btn.addEventListener("click", () => set(panel.hidden));
  panel.querySelector(".ev-share__close")?.addEventListener("click", () => set(false));
})();
