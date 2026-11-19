/* Exactly the original Swiper 7.3.1 settings — gallery (2s continuous advance · .4s pause · 3.5 slides), guardian voices (width auto · 24px), facility row on phones only */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  new Swiper(".js-swiper-g", {
    loop: true,
    speed: 2000,
    autoplay: reduce ? false : { delay: 400, disableOnInteraction: false },
    pagination: { el: ".swiper-pagination.p01", type: "bullets", clickable: true },
    navigation: { nextEl: ".swiper-button-next.p01", prevEl: ".swiper-button-prev.p01" },
    breakpoints: { 200: { spaceBetween: 20, centeredSlides: true, slidesPerView: 1 }, 768: { spaceBetween: 24, centeredSlides: false, slidesPerView: 3.5 } },
  });
  new Swiper(".js-swiper-p", {
    pagination: { el: ".swiper-pagination.p02", type: "bullets", clickable: true },
    navigation: { nextEl: ".swiper-button-next.p02", prevEl: ".swiper-button-prev.p02" },
    breakpoints: { 200: { spaceBetween: 20, centeredSlides: true, slidesPerView: 1 }, 768: { spaceBetween: 24, centeredSlides: false, slidesPerView: "auto" } },
  });
})();
