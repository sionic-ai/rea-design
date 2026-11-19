// Home page — loader (lifts .6s after 1.5s) · Hero Swiper fade (1.2s·5s) · News tabs · phone plan accordion (.35s)
(() => {
  const $ = window.jQuery;
  if (!$) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  $("body").addClass("scroll-stop");

  const start = () => {
    setTimeout(() => {
      $("#dz-loading").fadeOut(reduce ? 0 : 600);
      $("body").removeClass("scroll-stop");
    }, reduce ? 0 : 1500);

    if (window.Swiper) {
      new Swiper(".dz-hero__slider", {
        loop: true,
        speed: reduce ? 0 : 1200,
        effect: "fade",
        autoplay: reduce ? false : { delay: 5000, disableOnInteraction: false },
        pagination: { el: ".dz-hero__pagination" },
        navigation: { prevEl: ".dz-hero__prev", nextEl: ".dz-hero__next" },
      });
    }

    // Tab — pressing swaps immediately (original fadeOut(0) → fadeIn('active') turns on in jQuery’s default 400ms)
    const tabs = (btns, panels, on) => {
      $(btns).on("click", function () {
        const i = $(btns).index(this);
        $(btns).removeClass(on);
        $(panels).removeClass("active");
        $(this).addClass(on);
        $(panels).fadeOut(0).eq(i).fadeIn(reduce ? 0 : 400).addClass("active");
      });
    };
    tabs(".dz-news__cats .dz-news__cat-item", ".dz-news__list", "current_cat");

    if (innerWidth <= 1024) {
      $(".dz-price__heading").on("click", function () {
        const $row = $(this).parent();
        $row.siblings(".dz-price__row").removeClass("active");
        $row.toggleClass("active");
        $(".dz-price__contents").not($(this).next()).stop().slideUp(reduce ? 0 : 350);
        $(this).next(".dz-price__contents").stop().slideToggle(reduce ? 0 : 350);
      });
    }
  };
  if (document.readyState === "complete") start(); else $(window).on("load", start);
})();
