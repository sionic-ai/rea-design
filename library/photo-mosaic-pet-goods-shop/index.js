// Four Swipers on the first page, original setting values as is (Swiper 7.4.1)
(() => {
  const still = window.acReduce;
  new Swiper("[data-slider='mvSlider']", {
    loop: true, slidesPerView: 1, speed: 4000, effect: "fade",
    autoplay: still ? false : { delay: 4000, disableOnInteraction: false },
    pagination: { el: "[data-slider='mvPagination']", clickable: true },
  });
  new Swiper("[data-slider='pickUp']", {
    loop: true, centeredSlides: true, slidesPerView: 1, spaceBetween: 1,
    pagination: { el: "[data-pagination='pickUp']", clickable: true },
    navigation: { nextEl: ".ix-pick__nav--next, .ix-pick__arrow--next", prevEl: ".ix-pick__nav--prev, .ix-pick__arrow--prev" },
    breakpoints: { 751: { slidesPerView: 1.75 } },
  });
  new Swiper("[data-slider='reviewSlider']", { loop: false, speed: 500, slidesPerView: 1.2, breakpoints: { 751: { slidesPerView: 4.3 } } });
  new Swiper("[data-slider='sliderFlow']", {
    speed: 12000, slidesPerView: 1.25, loop: true, allowTouchMove: false,
    autoplay: still ? false : { delay: 0, disableOnInteraction: false },
  });
})();
