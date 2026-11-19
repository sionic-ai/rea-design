// Product info — two bxSlider instances from the original base.js with the same settings. The header photo runs as fade (every 4s, .4s), and on load the plate appears over .6s linear.
// The controller band is a 310-cell horizontal slider — one cell every 3s in .4s, auto-play pauses during the slide then resumes, and it pauses when the pointer is over it
(() => {
  if (!window.jQuery || !jQuery.fn.bxSlider) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = document.getElementById("products-img");
  const $hero = jQuery(".pd-hero__slides");
  const many = $hero.children().length >= 2;
  const heroSlider = $hero.bxSlider({
    mode: "fade", auto: many && !reduce, speed: 400, pause: 4000, moveSlides: 1, slideMargin: 0,
    pager: many, controls: false, responsive: true, touchEnabled: true,
    onSlideBefore: () => heroSlider?.stopAuto?.(), onSlideAfter: () => many && !reduce && heroSlider?.startAuto?.(),
    onSliderLoad: () => gsap.to(hero, { opacity: 1, duration: reduce ? 0 : 0.6, ease: "none" }),
  });
  const ctrl = jQuery("#slider-products").bxSlider({
    auto: !reduce, speed: 400, pause: 3000, slideWidth: 310, minSlides: 1, maxSlides: 11, moveSlides: 1, slideMargin: 0,
    pager: false, controls: true, autoHover: true, touchEnabled: false, prevText: "Previous", nextText: "Next",
    onSlideBefore: () => ctrl?.stopAuto?.(), onSlideAfter: () => !reduce && ctrl?.startAuto?.(),
  });
})();
