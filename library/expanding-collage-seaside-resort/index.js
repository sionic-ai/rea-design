// Home page: the two hero photo cells use the same Swiper (11 · fade) as the original, crossfading every 4s over 3s and looping endlessly
(() => {
  if (!window.Swiper) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".js-kv-slider").forEach((el) => {
    new Swiper(el, {
      loop: true,
      effect: "fade",
      speed: reduce ? 0 : 3000,
      centeredSlides: true,
      autoplay: reduce ? false : { delay: 4000, disableOnInteraction: false },
    });
  });
})();
