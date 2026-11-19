/* Eleven-creator greeting card — loading curtain lift, creator list panel, creator intro panel */
(() => {
  // Loading — the original hides #loading on window load and starts the hero sequence
  const loading = document.querySelector(".ng-loading");
  const ready = () => { loading?.classList.add("is-hide"); document.dispatchEvent(new CustomEvent("ng:ready")); };
  if (document.readyState === "complete") setTimeout(ready, 0); else addEventListener("load", ready, { once: true });

  // Author list panel — opened and closed with a button, and it closes when a link inside is clicked (page turning is handled by rtl-scroll-track)
  const btn = document.querySelector("[data-ng-menu]"), nav = document.querySelector(".ng-gnav");
  const setMenu = (on) => { btn?.classList.toggle("is-open", on); nav?.classList.toggle("is-open", on); btn?.setAttribute("aria-expanded", on); };
  btn?.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  nav?.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Author bio panel — the profile button opens and closes it, plus a close button
  document.addEventListener("click", (e) => {
    const pf = e.target.closest("[data-ng-profile]"), x = e.target.closest("[data-ng-close]");
    const sec = (pf || x)?.closest(".ng-cr");
    if (!sec) return;
    const on = pf ? !sec.classList.contains("is-modal") : false;
    sec.classList.toggle("is-modal", on);
    sec.querySelector("[data-ng-profile]")?.setAttribute("aria-expanded", on);
  });
})();
