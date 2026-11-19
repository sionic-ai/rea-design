// News — featured post: Splide fade · auto every 5s · loops from end to start (doesn’t stop on hover). The category box filters cards in place
(() => {
  const el = document.querySelector('[data-js="article-slider"]');
  if (el && window.Splide) {
    const one = el.querySelectorAll(".splide__slide").length === 1;
    new Splide(el, { type: "fade", autoplay: !U.reduce, pauseOnFocus: false, rewind: true, interval: 5000, pauseOnHover: false, pagination: true, arrows: true, destroy: one ? "completely" : false }).mount();
  }
  const btns = [...document.querySelectorAll(".newsSide__cats button")], cards = [...document.querySelectorAll(".articleCard")];
  btns.forEach((b) => b.addEventListener("click", () => {
    btns.forEach((x) => x.classList.toggle("is-on", x === b));
    cards.forEach((c) => (c.hidden = b.dataset.cat !== "all" && c.dataset.cat !== b.dataset.cat));
    ScrollTrigger.refresh();
  }));
})();
