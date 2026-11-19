/* Single-page site, so only things spanning several sections — floating header panel (drops down after 1.2s) · dropdown · phone menu, show-on-visible (.js-ani → .on), back-to-top button, popup.
   The original uses jQuery 3.7.1 — the same version is bundled to reuse the swing curve and duration of fadeIn/fadeOut·slideToggle as is. */
(() => {
  const $ = window.jQuery;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) $.fx.off = true;

  // Hero: .on after 400ms — five photos at .2s intervals 1s ease-in by CSS, the header panel comes down at 1.2s over .8s
  // If the first paint is later than 400ms because of fetching font CSS, .on attaches before painting and the transition gets skipped — attach to the frame after painting the first frame
  const mvOn = () => { $(".t-mv").addClass("on"); $(".t-hdr").addClass("on"); };
  setTimeout(() => (reduce ? mvOn() : requestAnimationFrame(() => requestAnimationFrame(mvOn))), reduce ? 0 : 400);

  // Hand-drawn decoration group (.js-ani) — once it passes the bottom edge of the screen, attach .on (once)
  const ani = () => {
    const h = innerHeight, y = scrollY;
    document.querySelectorAll(".js-ani:not(.on)").forEach((el) => {
      if (y + h > el.getBoundingClientRect().top + y) el.classList.add("on");
    });
  };
  addEventListener("scroll", ani, { passive: true });
  addEventListener("resize", ani);
  ani();

  // Back to top: fadeIn(300) when past 600px and before reaching the footer, otherwise fadeOut(400)
  const top = $(".js-pagetop");
  $(window).on("scroll resize", () => {
    const s = $(window).scrollTop(), rest = $(document).height() - $(window).height() - s, f = $(".t-ftr").outerHeight();
    if (s > 600 && rest > f) top.stop(true).fadeIn(300); else top.stop(true).fadeOut(400);
  });

  // Dropdown (fadeIn on hover for wide screens) · on phones, tapping the arrow does slideToggle
  $(".js-hover").on("mouseenter", function () { if ($(window).width() > 767) $(this).children(".js-list").stop().fadeIn(); })
    .on("mouseleave", function () { if ($(window).width() > 767) $(this).children(".js-list").stop().fadeOut(); });
  $(".js-arrow").on("click", function (e) {
    e.preventDefault();
    if ($(window).width() <= 767) { $(this).toggleClass("is-active"); $(this).closest(".js-hover").children(".js-list").stop().slideToggle(); }
  });
  $(".js-menu").on("click", function () { $(".js-gnav").toggleClass("is-open"); $(".js-menu").toggleClass("is-open"); });

  // Popup: on click block html scroll and fadeIn the backdrop and panel, fadeOut via backdrop or close
  $(".pop-btn").on("click", function (e) {
    e.preventDefault();
    $("html").css("overflow", "hidden");
    $(document.getElementById($(this).data("target"))).find(".popup-bg,.popup-inner").fadeIn();
  });
  $(".js-close").on("click", () => { $(".popup-bg,.popup-inner").fadeOut(); $("html").css("overflow", "scroll"); });
})();
