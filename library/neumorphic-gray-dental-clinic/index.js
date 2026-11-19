// Home-only motion — slick (vertical photo strip) and rellax (photos between sections), exactly as in the original
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.jQuery && jQuery.fn.slick) {
    jQuery(".mt-gallery__slide").slick({
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
  // Original attaches at window.onload with center: true (speed is the rellax default −2)
  const start = () => { if (window.Rellax && !reduce && document.querySelector(".js-rellax")) new Rellax(".js-rellax", { center: true }); };
  if (document.readyState === "complete") start();
  else addEventListener("load", start);
})();
