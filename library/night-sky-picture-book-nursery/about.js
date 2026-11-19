// Original about.js: picture strip Splide auto-scroll (.8px/frame, width per photo, no drag).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  new Splide(".motif__slider", {
    type: "loop", arrows: false, pagination: false, drag: false, autoWidth: true, perPage: 4, gap: 0,
    breakpoints: { 896: { perPage: 2 } },
    autoScroll: { speed: reduce ? 0 : 0.8, pauseOnHover: false },
  }).mount(window.splide.Extensions);
})();
