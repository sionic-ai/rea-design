(function ($) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Land cards — slick center mode, stays 4 seconds and advances in 1.5 seconds. Stops at 3 or fewer cards on wide screens, 1 or fewer on phones
  $(".ej-search__slider").each(function () {
    const $s = $(this), n = $s.children().length, sp = window.innerWidth <= 767;
    if ((sp && n <= 1) || (!sp && n <= 3)) { $s.addClass("slide-disabled"); return; }
    $s.slick({ autoplay: !reduce, infinite: true, autoplaySpeed: 4000, speed: 1500, variableWidth: true, centerMode: true, dots: false, arrows: false });
  });
  // Photo strip — flows linearly over 10s without pausing
  $(".ej-gal__slider").slick({ autoplay: !reduce, autoplaySpeed: 0, infinite: true, centerMode: true, speed: 10000, variableWidth: true, cssEase: "linear", swipe: false, arrows: false, pauseOnFocus: false, pauseOnHover: false });
})(jQuery);
