// Service: header image parallax, glossary window open and close (.3s). Accordion and reveal live in shared.js.
(() => {
  const modal = document.querySelector(".sv-modal");
  const set = (open) => {
    modal.classList.toggle("is-open", open);
    modal.setAttribute("aria-hidden", String(!open));
    document.documentElement.style.overflow = open ? "hidden" : "";
  };
  document.querySelectorAll("[data-modal-open]").forEach((b) => b.addEventListener("click", () => set(true)));
  modal.querySelectorAll("[data-modal-close]").forEach((b) => b.addEventListener("click", () => set(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  // Glossary panel bar: the original script is not in the archive, so judged as fill by amount scrolled down — height = Scroll progress
  const sc = modal.querySelector(".sv-modal__scroll"), thumb = modal.querySelector(".sv-modal__bar i");
  const fill = () => { const max = sc.scrollHeight - sc.clientHeight; thumb.style.height = `${max > 0 ? (sc.scrollTop / max) * 100 : 100}%`; };
  sc.addEventListener("scroll", fill, { passive: true });
  document.querySelectorAll("[data-modal-open]").forEach((b) => b.addEventListener("click", () => requestAnimationFrame(fill)));
  window.FT.initPara();
})();
