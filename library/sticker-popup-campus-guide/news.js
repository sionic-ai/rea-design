// Magazine — hero fade carousel (original Cc(): Embla {loop, align: center, skipSnaps, containScroll: false} + Fade + Autoplay{delay 4000, does not stop even when interrupted}, if there is only one, hide the prev and next buttons)
(() => {
  const root = document.getElementById("magazine-mv-carousel");
  if (!root || typeof EmblaCarousel !== "function") return;
  const prev = root.querySelector("#magazine-carousel-prev"), next = root.querySelector("#magazine-carousel-next");
  if (root.querySelectorAll(".mmv__slide").length < 2) { prev.style.display = "none"; next.style.display = "none"; return; }
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const plugins = [EmblaCarouselFade()];
  if (!reduce) plugins.push(EmblaCarouselAutoplay({ playOnInit: true, stopOnInteraction: false, stopOnFocusIn: false, stopOnMouseEnter: false }));
  const api = EmblaCarousel(root.querySelector(".mmv__viewport"), { loop: true, align: "center", skipSnaps: true, containScroll: false }, plugins);
  window.mcEmblaButtons(api, prev, next);
})();
