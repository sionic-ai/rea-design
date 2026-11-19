// Hero slider — same Splide 4.1.2 + auto-scroll 0.5.3 as the original, with the settings copied as is (homepage.min.js)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bnr = document.querySelector("[data-bnr]");
  if (bnr) new Splide(bnr, {
    type: "loop", pagination: true, autoplay: !reduce, arrows: true, interval: 3000, speed: 1500, rewind: true, perPage: 5, perMove: 1, gap: 40,
    breakpoints: { 1199: { gap: 20, perPage: 3 }, 767: { perPage: 1, gap: 25, padding: { left: "15%", right: "15%" } } },
  }).mount();
  // On wide screens the original also releases it with destroy and stacks photos vertically, only on phones (767 and below) it turns with a fade
  document.querySelectorAll("[data-fade]").forEach((el) => new Splide(el, {
    type: "fade", pagination: false, autoplay: !reduce, arrows: false, interval: 4000, speed: 1500, rewind: true, perPage: 1, focus: 0, perMove: 1, destroy: true,
    breakpoints: { 767: { destroy: false, pagination: true } },
  }).mount());
  document.querySelectorAll("[data-auto]").forEach((el) => new Splide(el, {
    type: "loop", drag: "free", focus: "center", snap: true, arrows: false, pagination: false, perPage: 5,
    autoScroll: reduce ? false : { speed: 0.4, pauseOnHover: false, pauseOnFocus: false },
    breakpoints: { 1199: { perPage: 4 }, 768: { perPage: 2 } },
  }).mount(window.splide.Extensions));
  const pick = document.querySelector("[data-pickup]");
  if (pick) new Splide(pick, {
    type: "loop", pagination: true, autoplay: !reduce, arrows: true, interval: 4000, speed: 1500, rewind: true, perPage: 3, perMove: 1, gap: 45,
    breakpoints: { 1199: { arrows: false, gap: 20, perPage: 2 }, 767: { arrows: false, perPage: 1, gap: 20, padding: { left: "15%", right: "15%" } } },
  }).mount();

  // Peninsula-shaped regional map — our own lines instead of the original map image
  document.querySelectorAll("[data-pref-map]").forEach((m) => {
    m.innerHTML = `<svg viewBox="0 0 320 300" role="img" aria-label="Peninsula area map">
      <path class="is-land" d="M150 20c20 6 34 22 30 40-3 14-16 20-12 34 5 16 26 18 30 36 4 18-14 30-10 48 3 14 20 22 18 38-2 18-24 28-42 34-20 7-40 22-62 18-18-3-26-20-22-36 4-16 22-24 26-40 4-14-8-26-6-40 3-18 22-26 26-44 4-16-8-32 0-46 6-10 16-18 24-42z"/>
      <path class="is-spot" d="M118 226l14-6 8 10-12 12-14-4z"/>
      <text x="196" y="80">Some peninsula</text><text x="196" y="100">Hot Spring Town</text><text x="196" y="120">Which city</text>
    </svg>`;
  });
})();
