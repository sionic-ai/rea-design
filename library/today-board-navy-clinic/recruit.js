// Careers — intro video window: the original dark scrim sharpens in .2s and the background blurs 2px, closes with Esc, outside press or ×
(() => {
  const modal = document.querySelector(".sh-modal");
  if (!modal) return;
  const open = (e) => { e.preventDefault(); modal.classList.add("is-on"); requestAnimationFrame(() => modal.classList.add("is-ready")); modal.setAttribute("aria-hidden", "false"); };
  const close = () => { modal.classList.remove("is-ready"); modal.setAttribute("aria-hidden", "true"); setTimeout(() => modal.classList.remove("is-on"), 200); };
  document.querySelectorAll(".js-modal").forEach((a) => a.addEventListener("click", open));
  modal.querySelector(".sh-modal__close").addEventListener("click", close);
  modal.addEventListener("click", (e) => { if (e.target === modal || e.target.classList.contains("sh-modal__in")) close(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("is-on")) close(); });
})();
