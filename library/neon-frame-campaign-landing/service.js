// Main site top: the first banner and the recommended slider use the same Splide 4.1.2 and the same options as the original (slider_fv and slider_bnr_wide in _slider.js).
// The .4s cubic-bezier(.25,1,.5,1) transition is Splide’s default, and the pause button is handled by Splide’s .splide__toggle.
(() => {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  new Splide(".s-fv__view", { type: "loop", focus: "center", autoplay: true, arrows: false, perPage: 1, interval: 5000, pauseOnHover: false, pauseOnFocus: false }).mount();
  // Loop when there are three or more cells, cell width 450 at 950 and above
  const car = document.querySelector(".s-car");
  const count = car.querySelectorAll(".splide__slide").length;
  new Splide(car, {
    type: count > 2 ? "loop" : "slide", focus: "center", perPage: 1, perMove: 1, autoplay: true, arrows: false, pagination: count > 1,
    trimSpace: false, updateOnMove: true, mediaQuery: "min", breakpoints: { 949: { fixedWidth: 450 } },
  }).mount();

  $$(".s-tabs button").forEach((b) => b.addEventListener("click", () => {
    $$(".s-tabs button").forEach((x) => x.classList.toggle("is-active", x === b));
    $$(".s-news").forEach((p) => p.classList.toggle("is-active", p.dataset.panel === b.dataset.tab));
  }));
})();
