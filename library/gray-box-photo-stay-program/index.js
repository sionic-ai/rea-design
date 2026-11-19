/* Hero sequence — numbers from the original scripts.js: after the loader starts lifting (1s), text card at 2s, scroll indicator · stamp at 3.5s, 
   Four photos hung with slick (fade · speed 3000 · autoplaySpeed 4000), the first one starts moving after 1s, auto-advance begins after 3.8s. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $slide = window.jQuery && jQuery("#lf-slide");
  const start = () => {
    setTimeout(() => document.querySelectorAll('[data-load="2"]').forEach((el) => el.classList.add("is-active")), reduce ? 0 : 2000);
    setTimeout(() => document.querySelectorAll('[data-load="3"]').forEach((el) => el.classList.add("is-active")), reduce ? 0 : 3500);
    if (!$slide || !$slide.length || !$slide.slick) return;
    $slide
      .on("init", () => {
        setTimeout(() => jQuery('.slick-slide[data-slick-index="0"]', $slide).attr("data-is-active", "true"), 1000);
      })
      .slick({
        fade: true, speed: reduce ? 0 : 3000, autoplaySpeed: 4000, arrows: false, dots: false, autoplay: !reduce,
        slidesToShow: 1, slidesToScroll: 1, infinite: true, pauseOnFocus: false, pauseOnHover: false, pauseOnDotsHover: false,
      })
      .on({
        beforeChange(e, slick, cur, next) {
          jQuery(".slick-slide", this).eq(next).attr("data-is-active", "true");
          jQuery(".slick-slide", this).eq(cur).attr("data-is-hide", "true");
        },
        afterChange() {
          jQuery('[data-is-hide="true"]', this).attr("data-is-active", "false").attr("data-is-hide", "false");
        },
      })
      .slick("slickPause");
    if (!reduce) setTimeout(() => $slide.slick("slickPlay"), 3800);
  };
  document.addEventListener("lf:loaded", start, { once: true });
  if (reduce) start();
})();
