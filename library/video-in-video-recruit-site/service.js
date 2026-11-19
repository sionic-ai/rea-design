// Work Insight — pressing a division banner raises a modal at .3s, and only the modal scrolls (the outer Lenis is paused)
(() => {
  const site = window.sfSite;
  const modal = document.querySelector(".sv-modal");
  if (!modal) return;
  const ttl = modal.querySelector(".sv-modal__ttl");
  const scroller = modal.querySelector(".sv-modal__scroller");
  let last = null;
  const open = (btn) => {
    last = btn;
    ttl.textContent = btn.dataset.modalOpen;
    scroller.scrollTo(0, 0);
    document.body.dataset.modal = "1";
    document.documentElement.style.overflow = "hidden";
    site.lenis?.stop();
    modal.querySelector(".sv-closebtn").focus({ preventScroll: true });
  };
  const close = () => {
    if (document.body.dataset.modal !== "1") return;
    document.body.dataset.modal = "0";
    document.documentElement.style.overflow = "";
    site.lenis?.start();
    last?.focus({ preventScroll: true });
  };
  document.body.dataset.modal = "0";
  document.querySelectorAll("[data-modal-open]").forEach((b) => b.addEventListener("click", () => open(b)));
  modal.querySelectorAll(".js-modal-close").forEach((b) => b.addEventListener("click", close));
  addEventListener("keydown", (e) => e.key === "Escape" && close());
})();
