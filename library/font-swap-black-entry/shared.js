// Handles only the end of the first entrance (title lands → remove html.is-intro) and two modals (entry form · share). Title and dot grid motion are done by the motion parts.
(() => {
  const root = document.documentElement;
  const endIntro = () => root.classList.remove("is-intro");
  // Fires fx:done when the title parts settle — in environments where parts don’t attach (scripts blocked), it is released after 4 seconds so the header and cards aren’t left hidden
  document.addEventListener("fx:done", (e) => { if (e.target.closest?.(".ct-title")) endIntro(); });
  setTimeout(endIntro, 4000);

  let opener = null;
  const open = (name, from) => {
    const modal = document.querySelector(`[data-modal="${name}"]`);
    if (!modal) return;
    opener = from || document.activeElement;
    modal.classList.add("is-active");
    modal.removeAttribute("aria-hidden");
    modal.querySelector("[data-modal-close]")?.focus({ preventScroll: true });
  };
  const close = (modal) => {
    if (!modal?.classList.contains("is-active")) return;
    modal.classList.remove("is-active");
    modal.setAttribute("aria-hidden", "true");
    opener?.focus?.({ preventScroll: true });
  };
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-modal-open]");
    // Share uses the device share sheet if there is one, and opens the share panel only when there is not (original ShareButton)
    if (t && t.dataset.modalOpen === "share" && navigator.share && /^https?:$/.test(location.protocol)) { e.preventDefault(); navigator.share({ url: location.href, title: document.title }).catch(() => {}); return; }
    if (t) { e.preventDefault(); open(t.dataset.modalOpen, t); return; }
    const c = e.target.closest("[data-modal-close]");
    if (c) { close(c.closest("[data-modal]")); return; }
    // Tapping outside the panel (scrim) closes it
    const m = e.target.closest("[data-modal]");
    if (m && !e.target.closest(".ct-modal__inner")) close(m);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") document.querySelectorAll("[data-modal].is-active").forEach(close);
  });
  document.querySelectorAll("[data-modal] form").forEach((f) => f.addEventListener("submit", (e) => { e.preventDefault(); close(f.closest("[data-modal]")); }));
})();
