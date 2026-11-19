// Member profile window — the original floats a window to body per card with Alpine x-teleport. This copy moves a single window to body and fills it with the pressed card’s content.
(() => {
  const modal = document.querySelector(".om-modal");
  if (!modal) return;
  document.body.append(modal);
  const panel = modal.querySelector(".om-modal__panel");
  const text = modal.querySelector(".om-modal__text");
  const tags = modal.querySelector(".om-modal__pic .om-member__tags");
  let timer = 0, from = null;

  const open = (card) => {
    clearTimeout(timer);
    from = card;
    modal.style.cssText = card.getAttribute("style") || "";
    text.replaceChildren(card.querySelector(".om-member__more").content.cloneNode(true));
    tags.innerHTML = card.querySelector(".om-member__tags").innerHTML;
    modal.classList.remove("is-closing");
    modal.hidden = false;
    modal.getBoundingClientRect();
    modal.classList.add("is-open");
    modal.querySelector(".om-plus").focus({ preventScroll: true });
  };
  const close = () => {
    if (modal.hidden || modal.classList.contains("is-closing")) return;
    modal.classList.remove("is-open");
    modal.classList.add("is-closing");
    timer = setTimeout(() => { modal.hidden = true; modal.classList.remove("is-closing"); }, 300);
    from?.querySelector(".om-plus")?.focus({ preventScroll: true });
  };

  document.querySelectorAll(".om-member").forEach((card) => {
    card.querySelector(".om-plus")?.addEventListener("click", () => open(card));
    card.querySelector(".om-member__pic .wf-img")?.addEventListener("click", () => open(card));
  });
  modal.querySelector(".om-plus").addEventListener("click", close);
  // Original x-on:click.outside — clicking outside the panel closes it
  modal.addEventListener("click", (e) => { if (!panel.contains(e.target)) close(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();
