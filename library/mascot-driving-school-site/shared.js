// Hamburger (.25s fade) · fade-up (.Anime) · phone submenu collapse · phone footer banner slick — attached after everything has loaded (load) via jQuery, like the original.
(() => {
  const $ = window.jQuery;
  if (!$) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $body = $("body");

  // Add run to any .Anime that reaches 90% of the screen (once)
  const runAnime = () => {
    const edge = $(window).scrollTop() + $(window).height() * 0.9;
    $(".Anime:not(.run)").each(function () { if (edge >= $(this).offset().top) $(this).addClass("run"); });
  };

  const start = () => {
    // When the hamburger (burger-cross-stage part) opens and closes, the drawer turns on and off in .25s
    const hbg = document.querySelector(".dz-hbg");
    hbg?.addEventListener("fx:open", () => { $(".dz-nav").stop().fadeIn(reduce ? 0 : 250); $body.addClass("scroll-stop"); });
    hbg?.addEventListener("fx:close", () => { $(".dz-nav").stop().fadeOut(reduce ? 0 : 250); $body.removeClass("scroll-stop"); });
    // On phone, tapping a same-page link such as Directions closes the drawer
    $(".dz-nav a[href*='#']").on("click", () => { if (innerWidth <= 1024) hbg?.dispatchEvent(new CustomEvent("fx:close")); });

    runAnime();
    $(window).on("scroll", runAnime);

    const w = innerWidth;
    if (w <= 1024) {
      $(".dz-nav__item--child > .dz-nav__link").on("click", function () {
        $(this).parent().toggleClass("active");
        $(this).next(".dz-nav__child").stop().slideToggle(reduce ? 0 : 300);
      });
      if ($.fn.slick) {
        $(".dz-banners").slick({
          arrows: false, dots: true, speed: 1000, centerMode: true, centerPadding: "13%", touchThreshold: 8,
          slidesToShow: w <= 599 ? 1 : 2,
        });
      }
    }
  };
  if (document.readyState === "complete") start(); else $(window).on("load", start);
})();
