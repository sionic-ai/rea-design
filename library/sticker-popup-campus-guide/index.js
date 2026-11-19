// Front page — event carousel (original Tc(): Embla {loop: false, containScroll: false} + previous/next buttons, disabled when it can go no further)
(() => {
  const root = document.getElementById("event-carousel");
  if (!root || typeof EmblaCarousel !== "function") return;
  const api = EmblaCarousel(root.querySelector(".event__viewport"), { loop: false, containScroll: false });
  window.mcEmblaButtons(api, root.querySelector("#event-carousel-prev"), root.querySelector("#event-carousel-next"));
})();
