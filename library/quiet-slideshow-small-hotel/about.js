// About — two photo sliders (horizontal center · vertical bottom) switch every 6.5s using the same Swiper overlap as the original
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".js-ab-swiper").forEach((el) => new Swiper(el, {
    effect: "fade", fadeEffect: { crossFade: true }, loop: true, speed: reduce ? 0 : 300,
    autoplay: reduce ? false : { delay: 6500 },
  }));
})();
