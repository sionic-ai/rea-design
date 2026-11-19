// Shop: other product photos slider — original swiper 3 slides · gap 25 · 1000ms · 4s auto · loop, on phone 1.3 slides centered · gap 15.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const el = document.querySelector(".pd-goods__swiper");
  if (!el || !window.Swiper) return;
  new Swiper(el, {
    slidesPerView: 3,
    spaceBetween: 25,
    loop: true,
    speed: reduce ? 0 : 1000,
    autoplay: reduce ? false : { delay: 4000, disableOnInteraction: false },
    pagination: { el: ".pd-goods__dots", clickable: true },
    breakpoints: { 0: { slidesPerView: 1.3, spaceBetween: 15, centeredSlides: true }, 768: { slidesPerView: 3, spaceBetween: 25, centeredSlides: false } },
  });
})();
