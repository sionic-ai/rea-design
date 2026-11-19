// Cuisine page slides — the original cuisine.js slick settings as is (slick-carousel 1.8.1).
(() => {
  if (!window.jQuery || !jQuery.fn.slick) return;
  const $ = jQuery;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Morning: center mode — leave 30vw empty on both sides and show just one large photo in the middle. Below 480px, 20px on both sides
  const $bf = $(".kh-breakfast-slide");
  $bf.on("init reInit afterChange", (e, slick, current) => {
    $(".kh-breakfast .kh-now").text((current || 0) + 1);
    $(".kh-breakfast .kh-all").text(slick.slideCount);
  });
  $bf.slick({
    arrows: true, autoplay: false, dots: false, centerMode: true, centerPadding: "30vw", slidesToShow: 1, speed: reduce ? 0 : 300,
    responsive: [{ breakpoint: 480, settings: { centerPadding: "20px", slidesToShow: 1 } }],
  });

  // Highlight: a fade that advances by itself without arrows (default 3s interval, 0.3s)
  $(".kh-fade-slide").slick({ arrows: false, autoplay: !reduce, fade: true, dots: false, slidesToShow: 1 });
})();
