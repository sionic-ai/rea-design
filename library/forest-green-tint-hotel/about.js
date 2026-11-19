// About: the photo strip uses Splide 4.1.2 + auto-scroll extension 0.5.3 like the original — photos 12rem wide (23rem from 1025) · 1rem gap move .2 (.4 from 1025)px per frame
// Flows endlessly to the left, and dragging pushes it freely (drag free · flickPower 300). Hovering does not stop it
(() => {
  document.querySelectorAll(".js-splide-gallery").forEach((slider) => {
    const el = slider.querySelector(".splide");
    if (!el) return;
    new Splide(el, {
      mediaQuery: "min",
      fixedWidth: "12rem",
      gap: "1rem",
      type: "loop",
      pagination: false,
      arrows: false,
      drag: "free",
      flickPower: 300,
      autoScroll: { speed: 0.2, pauseOnHover: false, pauseOnFocus: false },
      breakpoints: { 1025: { fixedWidth: "23rem", autoScroll: { speed: 0.4 } } },
    }).mount(window.splide.Extensions);
  });
})();
