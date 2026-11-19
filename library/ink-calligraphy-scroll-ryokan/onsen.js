// Hot spring page slider — the slick settings of the original onsen.js as they are (slick-carousel 1.8.1).
(() => {
  if (!window.jQuery || !jQuery.fn.slick) return;
  const $ = jQuery;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Big heading: centered mode (30vw on both sides, 20px under 480px) + section number
  const $bath = $(".kh-bath-slide");
  $bath.on("init reInit afterChange", (e, slick, current) => {
    $(".kh-bath .kh-now").text((current || 0) + 1);
    $(".kh-bath .kh-all").text(slick.slideCount);
  });
  $bath.slick({
    arrows: true, autoplay: false, dots: false, centerMode: true, centerPadding: "30vw", slidesToShow: 1, speed: reduce ? 0 : 300,
    responsive: [{ breakpoint: 480, settings: { centerPadding: "20px", slidesToShow: 1 } }],
  });

  // Two carousels: 0.6s linear fade, dots and arrows
  const fade = { adaptiveHeight: false, dots: true, autoplay: false, speed: reduce ? 0 : 600, fade: true, cssEase: "linear" };
  $(".kh-slide-a").slick(fade);
  $(".kh-slide-b").slick(fade);
})();
