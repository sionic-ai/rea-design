// Flowing vertical photo strip — one step every 6s, 2 photos (above 1280, 3 photos with 50px gaps)
(() => {
  new Swiper("[data-slider='aboutSlider']", {
    loop: true, speed: 6000, slidesPerView: 2, spaceBetween: 20,
    autoplay: window.acReduce ? false : { delay: 0, disableOnInteraction: false },
    breakpoints: { 1280: { slidesPerView: 3, spaceBetween: 50 } },
  });
})();
