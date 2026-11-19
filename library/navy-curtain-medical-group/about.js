// About us: the original two Splides — half-screen width, center-aligned autoplay (.under-slider01), and the cafe uses a square-dot slider (.under-slider02).
(() => {
  const g = document.querySelector(".tf-gallery");
  if (g) new Splide(g, {
    perPage: 1, perMove: 1, gap: 15, type: "loop", arrows: true, autoplay: true, speed: 1000, pauseOnFocus: false, pagination: false,
    focus: "center", fixedWidth: "50vw", i18n: TF.i18n, breakpoints: { 1024: { fixedWidth: "90vw", gap: 20, perPage: 1 } },
  }).mount();
  const c = document.querySelector(".tf-cafe");
  if (c) new Splide(c, {
    mediaQuery: "min", perPage: 1, perMove: 1, gap: 16, type: "loop", arrows: false, autoplay: false, speed: 1000, pauseOnFocus: false, pagination: true, i18n: TF.i18n,
  }).mount();
})();
