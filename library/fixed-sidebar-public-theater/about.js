// Four tabs — same jQuery UI tabs as the original. On phones the current tab name is shown big on top, and the photo fade (slick, 2s every 3s) re-measures its position when the tab changes
(() => {
  const $ = window.jQuery;
  if (!$ || !$.fn.tabs) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tabs = $("#tab").tabs();
  // Pin the first two classes of the slide li — when slick adds and removes slick-current · slick-active, the first two class names the measuring tool uses to recognize a self-changing element would shake,
  // Photo fade is blended with the hover and click motion measured at that moment
  // In the original this slick doesn’t run at phone width (767 or below) so two photos stack vertically — measured: 650px with no fade at 390, fade from 834.
  const slider = $.fn.slick && matchMedia("(min-width: 768px)").matches ? $(".rt-about__slider").slick({ lazyLoad: "progressive", arrows: false, dots: false, infinite: true, fade: true, autoplay: !reduce, autoplaySpeed: 3000, speed: reduce ? 0 : 2000 }) : null;
  tabs.find(".tab-nav-btn a").on("click", function () {
    history.pushState(null, null, $(this).attr("href"));
    $(".rt-pagenav__spttl").text($(this).text());
    slider?.slick("setPosition");
  });
})();
