// Gallery — original main.js Gallery module: clicking a photo puts that photo’s large panel in a micromodal window, and prev·next swap in the adjacent slot’s panel
(() => {
  const id = "js-gallery-modal";
  const box = document.querySelector(`#${id} .modal__container`);
  let current = null;
  const show = (item) => {
    const tpl = item?.querySelector("[data-gallery-container]");
    if (!tpl) return;
    current = item;
    box.innerHTML = tpl.innerHTML;
  };
  addEventListener("load", () => {
    document.querySelectorAll("[data-gallery-trigger]").forEach((t) => t.addEventListener("click", () => {
      MicroModal.show(id, {
        onShow: () => { show(t.closest("[data-gallery-item]")); box.scrollTop = 0; document.body.classList.add("is-modal-opened"); window.siteLenis?.stop(); },
        onClose: () => { box.innerHTML = ""; document.body.classList.remove("is-modal-opened"); window.siteLenis?.start(); },
        disableScroll: true,
        disableFocus: true,
        awaitOpenAnimation: true,
        awaitCloseAnimation: true,
      });
    }));
    document.querySelector("[data-gallery-prev]")?.addEventListener("click", (e) => { e.stopPropagation(); show(current?.previousElementSibling); });
    document.querySelector("[data-gallery-next]")?.addEventListener("click", (e) => { e.stopPropagation(); show(current?.nextElementSibling); });
    document.querySelector("[data-gallery-close]")?.addEventListener("click", () => MicroModal.close(id));
  });
})();
