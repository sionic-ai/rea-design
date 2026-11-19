// Every page — same triggers and same lengths as the original (jQuery + imagesLoaded).
// Once all photos are loaded, the loading panel lifts after 600ms (1s) and the body appears in .6s. The first page hides the header row until scrolled past 500px (.25s).
// The phone menu opens and closes with the button and curtain, and closes on scroll or window resize. # links glide with a 600ms swing.
window.jpSwipers = [];
$(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $body = $("body");
  const $head = $(".jp-head");
  const isHome = $body.hasClass("is-page-home");

  const check = () => {
    $body.removeClass("is-menu-open");
    if (isHome) {
      const point = $("#jp-point-narrow");
      const sw = point.offset().top - point.height();
      $head.toggleClass("is-home", $(window).scrollTop() <= sw);
    }
  };

  $(".jp-btnMenu, .jp-head__base").on("click", () => $body.toggleClass("is-menu-open"));
  $(window).on("scroll resize", check);

  $('a[href*="#"]').on("click", function () {
    const href = $(this).attr("href");
    const hash = href.slice(href.indexOf("#"));
    const $t = $(hash === "#" ? "html" : hash);
    if (!$t.length) return false;
    $("body, html").animate({ scrollTop: $t.offset().top }, reduce ? 0 : 600, "swing");
    check();
    return false;
  });

  const start = () => {
    if (window.jpInit) window.jpInit({ reduce });
    check();
    setTimeout(() => $body.addClass("is-loaded"), reduce ? 0 : 600);
  };
  const $targets = $(".jp-loadTarget");
  if ($targets.length && $.fn.imagesLoaded) $targets.imagesLoaded({ background: true }, start);
  else start();
});
