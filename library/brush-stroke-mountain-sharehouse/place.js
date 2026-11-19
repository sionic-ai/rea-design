// Plus button on the facility card — pressing it opens a modal showing that photo large (Studio modal · Vue transition: on open, v-enter-from is applied to the inner panel for one frame then removed, so it rises from 100px below and transparent over .4s, and the backdrop fades in over .4s). Closes via backdrop, close button or Esc
(() => {
  const dlg = document.querySelector(".pl-zoom");
  const box = dlg?.querySelector(".pl-zoom__box");
  if (!dlg || !box) return;
  const img = box.querySelector(".pl-zoom__img");
  let timer = 0;
  const open = (ph) => {
    clearTimeout(timer);
    if (ph && img) img.dataset.label = ph.dataset.label;
    box.classList.remove("is-leave");
    box.classList.add("is-from");
    dlg.showModal();
    void box.offsetWidth;
    requestAnimationFrame(() => { box.classList.remove("is-from"); dlg.classList.add("is-in"); });
  };
  const close = () => {
    clearTimeout(timer);
    dlg.classList.remove("is-in");
    box.classList.add("is-leave");
    timer = setTimeout(() => { dlg.close(); box.classList.remove("is-leave"); }, 400);
  };
  document.querySelectorAll("[data-zoom]").forEach((btn) => btn.addEventListener("click", () => open(btn.querySelector(".su-photo"))));
  dlg.querySelector(".pl-zoom__close")?.addEventListener("click", close);
  dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); });
  dlg.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
})();
