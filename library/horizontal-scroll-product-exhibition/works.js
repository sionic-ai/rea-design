// Large photo slider above the payment cases — original slick settings as is (5s autoplay, 1s transition, dots · arrows, infinite, does not pause on hover)
(() => {
  if (!window.jQuery || !jQuery.fn.slick) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  jQuery(".pa-hero__list").slick({ autoplay: !reduce, autoplaySpeed: 5000, speed: reduce ? 0 : 1000, dots: true, arrows: true, infinite: true, pauseOnHover: false });
})();
