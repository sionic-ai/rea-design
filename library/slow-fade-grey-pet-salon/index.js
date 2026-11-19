// Five Hero photos — same slick 1.8.1 fade as the original (1.5 seconds). Only the first stays 6.6 seconds, then shortens to 3 seconds from the moment it advances.
(() => {
  const $ = window.jQuery;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wide = () => $(window).width() > 768;

  $(window).on("load", () => {
    const $slide = $(".dm-hero-slide");
    $slide.slick({
      autoplay: !reduce,
      dots: false,
      infinite: true,
      fade: true,
      speed: 1500,
      arrows: false,
      pauseOnFocus: false,
      pauseOnHover: false,
      pauseOnDotsHover: false,
      autoplaySpeed: 6600,
      draggable: false,
      swipe: false,
      touchMove: false,
    });
    $slide.on("beforeChange", () => {
      $slide.slick("slickSetOption", "autoplaySpeed", 3000, true);
    });

    if (reduce) {
      $(wide() ? ".dm-scroll" : ".dm-scroll-sp").show();
      return;
    }
    $(wide() ? ".dm-scroll" : ".dm-scroll-sp").delay(4700).fadeIn(300);
  });

  if (reduce) return;
  $(window).on("scroll", () => {
    const $label = $(wide() ? ".dm-scroll" : ".dm-scroll-sp");
    if (window.pageYOffset > 10) $label.fadeOut();
    else $label.fadeIn();
  });
})();
