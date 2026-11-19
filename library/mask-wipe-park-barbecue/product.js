// Menu page — a photo Splide per menu (a single photo means no arrows or dots), the masked photo row flows endlessly via Splide auto-scroll (speed 1, .5 on phone).
(() => {
  if (!window.Splide) return;
  const arrowPath = "M13 4l16 16-16 16";
  document.querySelectorAll("#course .splide").forEach((el) => {
    const many = el.querySelectorAll(".splide__slide").length > 1;
    new Splide(el, { arrows: many, pagination: many, arrowPath }).mount();
  });
  const gallery = document.querySelector("#gallery .splide");
  if (!gallery) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  new Splide(gallery, {
    type: "loop",
    rewind: true,
    arrows: false,
    pagination: false,
    drag: false,
    focus: "center",
    autoWidth: true,
    gap: 60,
    autoScroll: { speed: reduce ? 0 : 1, pauseOnHover: false, pauseOnFocus: false },
    breakpoints: { 767: { gap: 0, autoScroll: { speed: reduce ? 0 : 0.5, pauseOnHover: false, pauseOnFocus: false } } },
  }).mount(window.splide?.Extensions);
})();
