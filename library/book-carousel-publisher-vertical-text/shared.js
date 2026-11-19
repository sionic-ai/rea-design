// Header for every page — built with the same gauges and same lengths as the original (jQuery).
// Above 620px (phone 520px) a fixed header, a three-line button opens the full menu, hovering the genre strip opens a mega menu, field expansion uses slideToggle (400ms swing).
$(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $head = $(".br-head");
  const $main = $(".br-main");

  $(".br-hum").on("click", function () {
    $("body").toggleClass("is-fix");
    $head.toggleClass("is-open");
  });

  const toggleSub = ($bt) => {
    $bt.prev().toggleClass("is-active");
    $bt.toggleClass("is-active");
    $bt.next().slideToggle(reduce ? 0 : 400);
  };
  $(".br-dnav__toggle").on("click", function () {
    toggleSub($(this));
    if ($(window).width() <= 1150) return false;
  });
  $(".br-dnav__link.is-toggle").on("click", function () {
    if ($(window).width() > 1150) return;
    toggleSub($(this).next());
    return false;
  });

  $(".br-gnav__bt, .br-gnav a:not(.is-toggle)").on("click", function () {
    $("body").removeClass("is-fix");
    $head.removeClass("is-open");
    if ($(this).is(".br-gnav__bt")) return false;
  });

  $('a[href^="#"]').on("click", function () {
    const href = $(this).attr("href");
    if ($(this).is("[role=button]") && href === "#") return false;
    const $t = $(href === "#" || href === "" ? "html" : href);
    if (!$t.length) return false;
    $("html, body").animate({ scrollTop: $t.offset().top - $head.outerHeight() }, reduce ? 0 : 600, "swing");
    return false;
  });

  const limit = () => ($(window).width() <= 768 ? 520 : 620);
  const onScroll = () => {
    const on = $(window).scrollTop() > limit();
    $head.toggleClass("is-scrolled", on);
    $main.toggleClass("is-scrolled", on);
  };
  $(window).on("scroll", onScroll);
  onScroll();

  $(".br-kinds__link").on({
    mouseenter() { $(this).next().addClass("is-active"); },
    mouseleave() { $(this).next().removeClass("is-active"); },
  });
  $(".br-kinds__sub").on({
    mouseenter() { $(this).addClass("is-active"); },
    mouseleave() { $(this).removeClass("is-active"); },
  });

  $(".br-search__link").on("click", function () {
    $(".br-search__text").toggleClass("is-active");
    return false;
  });
});
