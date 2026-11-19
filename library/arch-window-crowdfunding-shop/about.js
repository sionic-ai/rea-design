// About company: phone hamburger opens the menu panel, round button at bottom right scrolls to top
(() => {
  const head = document.querySelector(".co-head");
  head.querySelector(".co-burger").addEventListener("click", () => head.classList.toggle("is-open"));
  document.querySelector(".co-top").addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: "smooth" }); });
})();
// Header photo and activity slider — same slick 1.8 settings as the original
(($) => {
  $("[data-kv]").slick({ arrows: false, dots: false, fade: true, autoplay: true, autoplaySpeed: 3000, speed: 2000, pauseOnHover: false, pauseOnFocus: false });
  $(".co-car__box").slick({
    dots: true, arrows: true, appendDots: $(".co-car__dots"), slidesToShow: 2, centerMode: true, centerPadding: "20px",
    prevArrow: $(".co-car__prev"), nextArrow: $(".co-car__next"),
    responsive: [{ breakpoint: 768, settings: { slidesToShow: 1, centerPadding: "10.13vw", infinite: false } }],
  });
})(jQuery);
