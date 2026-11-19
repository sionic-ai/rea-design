// About — original ss02_slide: 3s after window load, attach a fade-crossing Swiper (hold 3s · speed 2s · clickable dots)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const start = () => setTimeout(() => {
    new Swiper(".ac-ss02__slide .swiper-container", { loop: true, effect: "fade", fadeEffect: { crossFade: true }, autoplay: reduce ? false : { delay: 3000, disableOnInteraction: false }, speed: 2000, pagination: { el: ".ac-ss02__dots", clickable: true } });
  }, 3000);
  if (document.readyState === "complete") start(); else addEventListener("load", start);
})();
