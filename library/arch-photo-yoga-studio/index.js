// Home: instructor slider and instructor About modal — Splide 4 and micromodal as in the original, with the same options.
// Only one modal is kept and the name of the pressed cell is swapped in. Attach the slider first so buttons in cloned cells are also caught as modal triggers.
(() => {
  const slider = document.querySelector("[data-inst-slider]");
  if (slider && window.Splide) {
    new Splide(slider, {
      type: "loop",
      arrows: true,
      pagination: false,
      fixedWidth: "445px",
      gap: -80,
      speed: 1200,
      easing: "cubic-bezier(0.215, 0.61, 0.355, 1)",
      updateOnMove: true,
      breakpoints: { 575: { fixedWidth: "95%", gap: 50 } },
      i18n: { prev: "Previous instructor", next: "Next instructor", first: "As a first-time instructor", last: "As the final instructor", carousel: "Instructor List", slide: "Instructor", slideLabel: "%s / %s" },
    }).mount();
  }

  if (window.MicroModal && document.getElementById("an-modal-inst")) {
    MicroModal.init({
      disableFocus: true,
      disableScroll: true,
      awaitCloseAnimation: true,
      awaitOpenAnimation: true,
      onShow: (modal, active, e) => {
        window.anLenis?.stop();
        const from = e?.target?.closest?.("[data-name]") || active?.closest?.("[data-name]");
        if (from) modal.querySelectorAll("[data-modal-name]").forEach((el) => (el.textContent = from.dataset.name));
      },
      onClose: () => window.anLenis?.start(),
    });
  }
})();
