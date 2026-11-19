// Recruiting-site only: Hero photo alternation (original every 6s, opacity 1s ease-in-out), featured article carousel (same Embla as the original).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const slides = document.querySelectorAll(".rc-hero__img");
  let s = 0;
  if (!reduce) setInterval(() => {
    slides[s].classList.remove("is-on");
    s = (s + 1) % slides.length;
    slides[s].classList.add("is-on");
  }, 6000);

  // Recommended articles: Embla loop · containScroll off · first slot position is centered under 1024, and when wider max((screen − 1440) / 2, 140)
  const rail = document.querySelector(".rc-pick__rail");
  if (rail && window.EmblaCarousel) {
    const embla = EmblaCarousel(rail, {
      loop: true,
      containScroll: false,
      align: (view, snap) => (matchMedia("(max-width: 1023px)").matches ? (view - snap) / 2 : Math.max((view - 1440) / 2, 140)),
    });
    rail.querySelector(".rc-pick__btn.is-prev")?.addEventListener("click", () => embla.scrollPrev());
    rail.querySelector(".rc-pick__btn.is-next")?.addEventListener("click", () => embla.scrollNext());
  }
})();
