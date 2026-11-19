// Business About only: diagram arrow flow, adoption case slider (Embla), ‹Find by purpose› window.
(() => {
  // Pressing the finger marker makes only that business’s arrow flow as a dashed line (press again to stop)
  const map = document.querySelector(".sv-map__svg");
  map?.addEventListener("click", (e) => {
    const plat = e.target.closest(".sv-plat");
    if (!plat) return;
    const on = !plat.classList.contains("is-on");
    map.querySelectorAll(".sv-plat").forEach((p) => p.classList.remove("is-on"));
    map.querySelectorAll(".sv-flow").forEach((f) => f.classList.toggle("is-on", on && f.dataset.flow === plat.dataset.flow));
    plat.classList.toggle("is-on", on);
    map.classList.toggle("has-on", on);
  });

  // Work slider: same Embla (loop) as the original — the chosen slide number and slide count shown in the side numbers
  const cases = document.querySelector(".sv-cases");
  if (cases && window.EmblaCarousel) {
    const embla = EmblaCarousel(cases, { loop: true });
    const [now, all] = [cases.querySelector(".sv-cases__ctrl b"), cases.querySelector(".sv-cases__ctrl p")];
    const show = () => (now.textContent = embla.selectedScrollSnap() + 1);
    all.lastChild.textContent = embla.scrollSnapList().length;
    show();
    embla.on("select", show);
    cases.querySelector(".sv-cases__btn.is-prev").addEventListener("click", () => embla.scrollPrev());
    cases.querySelector(".sv-cases__btn.is-next").addEventListener("click", () => embla.scrollNext());
  }

  // ”Find by purpose” appears once the top nav leaves the screen
  const finder = document.querySelector(".sv-finder");
  const modal = document.querySelector(".sv-modal");
  new IntersectionObserver(([e]) => finder.classList.toggle("is-in", !e.isIntersecting)).observe(document.querySelector(".dg-header"));
  finder.addEventListener("click", () => modal.showModal());
  modal.querySelector(".sv-modal__close").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => { if (e.target === modal || e.target.closest("a")) modal.close(); });
})();
