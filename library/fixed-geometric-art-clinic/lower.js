/* About photo slider — the same Swiper (8) as the original, 1.8 slides centered, infinite, dots · arrows */
(() => {
  document.querySelectorAll(".tn-slider").forEach((el) => {
    if (!window.Swiper) return;
    new Swiper(el, { slidesPerView: 1.8, centeredSlides: true, loop: true, pagination: { el: el.querySelector(".tn-slider__pagination"), clickable: true }, navigation: { nextEl: el.querySelector(".tn-slider__next"), prevEl: el.querySelector(".tn-slider__prev") } });
  });
})();
