// Hero photos — same slick fade as the original (2s overlap every 4s, endless)
(() => {
  const $ = window.jQuery;
  if (!$ || !$.fn.slick) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  $(".rt-hero__slider").slick({ arrows: false, dots: false, infinite: true, fade: true, autoplay: !reduce, autoplaySpeed: 4000, speed: reduce ? 0 : 2000 });
})();
