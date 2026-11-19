// First page — flipbook hero: original Lay carousel (Swiper) autoplay 200ms · instant change (speed 0) · centered · 1px gap · drag or press for next
(() => {
  const el = document.querySelector("[data-sp-flip]");
  if (!el) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const flip = new Swiper(el, {
    loop: true,
    speed: 0,
    slidesPerView: 1,
    centeredSlides: true,
    spaceBetween: 1,
    autoplay: reduce ? false : { delay: 200, disableOnInteraction: false },
  });
  flip.on("click", () => flip.slideNext(0));
  window.spFlip = flip;
})();
