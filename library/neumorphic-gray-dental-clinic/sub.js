// Subpage — rellax as in the original (header photo speed 2 · −2 inside window, center) and slick (facility photo band, same values as the home page band)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.jQuery && jQuery.fn.slick && document.querySelector(".mt-facility__slide")) {
    jQuery(".mt-facility__slide").slick({
      slidesToShow: 1,
      autoplay: !reduce,
      autoplaySpeed: 5000,
      centerMode: true,
      centerPadding: "5%",
      variableWidth: true,
      adaptiveHeight: true,
      speed: 1000,
      arrows: false,
      pauseOnFocus: false,
      pauseOnHover: false,
    });
  }
  const start = () => { if (window.Rellax && !reduce && document.querySelector(".js-rellax")) new Rellax(".js-rellax", { center: true }); };
  if (document.readyState === "complete") start();
  else addEventListener("load", start);
})();
