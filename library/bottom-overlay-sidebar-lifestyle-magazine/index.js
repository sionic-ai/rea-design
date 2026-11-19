// First page — original swiper_front (three at a time, 1.1s, automatic every 3 seconds; 3·2·1 slides at 1024·768·414 and below) and swiper_series (same as the planning slider, every 9 seconds)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  new Swiper(".hk-swiper-front", {
    speed: 1100, slidesPerView: 3, spaceBetween: 20, grabCursor: true, keyboard: { enabled: true },
    breakpoints: { 1024: { slidesPerView: 3 }, 768: { slidesPerView: 2 }, 414: { slidesPerView: 1, spaceBetween: 0 } },
    loop: true, autoplay: reduce ? false : { delay: 3000, disableOnInteraction: true },
  });
  window.hkPickup(".hk-swiper-series", 9000);
})();
