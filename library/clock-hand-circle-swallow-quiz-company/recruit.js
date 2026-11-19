/* Member window — opens when a person card is pressed (1.1 → 1 scale, .6s springy), closes via × · outside click · Esc */
(() => {
  const modal = document.querySelector(".rc-modal");
  if (!modal) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const name = modal.querySelector(".rc-modal__name");
  const open = (card) => {
    name.textContent = card.querySelector(".sq-member__name").textContent;
    modal.showModal();
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add("is-open")));
  };
  const close = () => {
    modal.classList.remove("is-open");
    setTimeout(() => { if (modal.open) modal.close(); document.body.style.overflow = ""; }, reduce ? 0 : 300);
  };
  document.querySelectorAll(".sq-member[data-modal]").forEach((c) => {
    c.addEventListener("click", () => open(c));
    c.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(c); } });
  });
  modal.querySelector(".rc-modal__close").addEventListener("click", close);
  modal.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
})();
