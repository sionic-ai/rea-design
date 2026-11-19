// Motion shared by all sections — the same jQuery 3.7.0 + jquery.easing 1.4.1 (default curve swing → easeOutQuad) + slick 1.8.1 calls as the original, with the same values.
// The in-view check is rewritten in the same form as the original jquery.inview (checks every 250ms whether it’s on screen) — that package is WTFPL, so it is not bundled.
(function ($) {
  if (!$) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ua = function () { return $(window).width() < 768 ? "sp" : "pc"; };

  // Reveal: once it enters the screen, tag it with its type label (never undone)
  var MAP = { "sm-fadein-up": "sm-fadeInUp", "sm-fadein-l": "sm-fadeInLeft", "sm-fadein-r": "sm-fadeInRight" };
  function checkInview() {
    var vh = window.innerHeight;
    document.querySelectorAll(".sm-inview:not(.is-seen)").forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh && (r.width || r.height)) {
        el.classList.add("is-seen", "sm-animated");
        Object.keys(MAP).forEach(function (k) { if (el.classList.contains(k)) el.classList.add(MAP[k]); });
      }
    });
  }
  // Like the original plugin, the first check happens 250ms after the handle is attached
  if (reduce) $(".sm-inview").addClass("is-seen");
  else $(function () { setInterval(checkInview, 250); });

  $(function () {
    // Booking drawer: slides down over 600ms + panel fades in .4s
    function reserveClose() {
      $(".sm-reserve-link").removeClass("active").attr("aria-expanded", "false");
      $("body").removeClass("noscroll");
      $(".sm-contactnav").stop(false, false).slideUp(reduce ? 0 : 600).removeClass("active");
    }
    function reserveOpen() {
      $(".sm-reserve-link").addClass("active").attr("aria-expanded", "true");
      $("body").addClass("noscroll");
      $(".sm-contactnav").stop(false, false).slideDown(reduce ? 0 : 600).addClass("active");
    }
    $(".sm-reserve-link").on("click", function () { $(this).hasClass("active") ? reserveClose() : reserveOpen(); })
      .on("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); $(this).trigger("click"); } });

    // Phone menu: appears and disappears at the default length (400ms)
    $(".sm-trigger").on("click", function () {
      $(this).stop(false, false).toggleClass("active");
      $(".sm-mobilenav").fadeToggle(reduce ? 0 : 400);
      $("body").toggleClass("noscroll");
      if ($(".sm-reserve-link").hasClass("active")) reserveClose();
    });

    // Dropdown menu: on wide screens it appears in 300ms on hover and disappears in 200ms on leave
    if (ua() === "pc") {
      $(".has-child").on("mouseover", function () { $(this).find(".sm-menu-child").stop(false, false).fadeIn(300); })
        .on("mouseout", function () { $(".sm-menu-child").stop(false, false).fadeOut(200); });
    } else {
      $(".has-child > a").on("click", function () { $(this).next(".sm-menu-child").slideToggle(300); $(this).toggleClass("active"); });
    }

    // Pair recommendations (four at a time, 800ms every 3 seconds) — on phone, one in the center
    $(".sm-fair__slider").slick({
      dots: true, infinite: true, autoplay: !reduce, autoplaySpeed: 3000, speed: 800, slidesToShow: 4, slidesToScroll: 4, arrows: true,
      responsive: [{ breakpoint: 769, settings: { centerPadding: "50px", centerMode: true, slidesToShow: 1, slidesToScroll: 1, speed: 400 } }],
    });
    $(".sm-site-contents__slider").slick({
      dots: true, pauseOnHover: true, variableWidth: true, centerMode: true, infinite: true, autoplay: !reduce, autoplaySpeed: 4000, speed: 600,
      slidesToShow: 1, slidesToScroll: 1, arrows: true,
      responsive: [{ breakpoint: 769, settings: { centerPadding: "50px", slidesToShow: 1, slidesToScroll: 1 } }],
    });

    // In-page move: scrolls 500ms, stopping short by the header height
    $('a[href^="#"]').not('[href="#"]').on("click", function () {
      var t = $($(this).attr("href"));
      if (!t.length) return true;
      $("html, body").animate({ scrollTop: t.offset().top - $("#sm-header").outerHeight() }, reduce ? 0 : 500);
      return false;
    });
  });
})(window.jQuery);
