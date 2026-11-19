// Home page — outfit slider (Swiper 8.3.2 · 600ms · on wide screens 30px gaps per slot width) and plan slider (slick · two at a time every 3s over 1s)
(function ($) {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  $(function () {
    if (window.Swiper) {
      new Swiper(".sm-style__slider", {
        loop: false, speed: 600, spaceBetween: 20, centeredSlides: false, autoplay: false, autoHeight: true,
        navigation: { nextEl: ".sm-style__nav .swiper-button-next", prevEl: ".sm-style__nav .swiper-button-prev" },
        breakpoints: { 768: { slidesPerView: "auto", spaceBetween: 30 } },
      });
    }
    if ($ && $.fn.slick) {
      $(".sm-plan__slider").slick({
        dots: false, infinite: true, autoplay: !reduce, autoplaySpeed: 3000, speed: 1000, slidesToShow: 2, slidesToScroll: 2, arrows: true,
        responsive: [{ breakpoint: 769, settings: { centerPadding: "30px", centerMode: true, slidesToShow: 1 } }],
      });
    }
  });
})(window.jQuery);
