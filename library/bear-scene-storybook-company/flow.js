/* Manga enlarge view — original script.js initMangaModal: press to dialog.showModal + scroll lock, close by clicking outside or the × */
(() => {
  const modal = document.querySelector(".fl-modal");
  if (!modal) return;
  const slot = modal.querySelector(".fl-modal__img");
  const open = (art) => {
    slot.innerHTML = art.innerHTML;
    modal.showModal();
    document.body.style.overflow = "hidden";
  };
  document.querySelectorAll(".fl-manga").forEach((m) => {
    const art = m.querySelector(".fl-manga__img");
    m.querySelector("[data-manga-open]").addEventListener("click", () => open(art));
    art.addEventListener("click", () => open(art));
  });
  modal.querySelector(".fl-modal__close").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
  modal.addEventListener("close", () => { slot.innerHTML = ""; document.body.style.overflow = ""; });
})();
