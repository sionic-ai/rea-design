// First page — same slick as the original: large band with 1s transition · autoplay · dots · arrows (no arrows under 768), banner row with varied widths · centered · .2s transition (under 768 the slider is released and scrolls horizontally)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const arrow = (dir, label) => `<button class="slick-${dir}" type="button" aria-label="${label}"><span></span></button>`;
  $(".mv-slider").slick({
    prevArrow: arrow("prev", "Previous"), nextArrow: arrow("next", "Next"),
    arrows: true, dots: true, infinite: true, slidesToShow: 1, fade: false,
    speed: reduce ? 0 : 1000, autoplay: !reduce,
    responsive: [{ breakpoint: 768, settings: { arrows: false } }],
  });
  // Video tile: like the original, a magnific-popup window (closes over .3 seconds) — instead of the original video, a placeholder video of the same ratio
  $(".js-modal").magnificPopup({ type: "inline", removalDelay: reduce ? 0 : 300 });
  $(".banner-slider").slick({
    prevArrow: arrow("prev", "Previous"), nextArrow: arrow("next", "Next"),
    arrows: true, infinite: true, speed: reduce ? 0 : 200, variableWidth: true, slidesToShow: 2, centerMode: true,
    responsive: [{ breakpoint: 768, settings: "unslick" }],
  });
})();
