// Careers page — the original is a differently shaped site from the same family (jQuery · slick 1.8.0, no smooth scroll), so that version is used as is:
// Wide photo slider (turns on 300ms after reading the window, every 3 seconds 800ms ease-in-out), inner links stop 130px below the headband with a 500ms swing, phone drawer menu.
(() => {
  const $ = jQuery;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Original turns it on 300ms after the window has finished reading — until then slick-slide stays hidden
  $(window).on("load", () => setTimeout(() => $(".r-slider").not(".slick-initialized").slick({
    centerMode: true, centerPadding: "0px", slidesToShow: 1, slidesToScroll: 1, infinite: true, dots: true,
    prevArrow: "", nextArrow: "", autoplay: !reduce, autoplaySpeed: 3000, speed: reduce ? 0 : 800, cssEase: "ease-in-out", pauseOnHover: false,
  }), 300));

  const page = document.body;
  const burger = document.querySelector(".r-burger");
  const set = (open) => {
    page.classList.toggle("is-rmenu", open);
    burger?.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    page.style.overflow = open ? "hidden" : "";
  };
  burger?.addEventListener("click", () => set(!page.classList.contains("is-rmenu")));

  $('a[href^="#"]').on("click", function () {
    const href = $(this).attr("href");
    const to = $(href === "#" ? "html" : href);
    if (!to.length) return true;
    if (page.classList.contains("is-rmenu")) set(false);
    $("html, body").animate({ scrollTop: to.offset().top - 130 }, reduce ? 0 : 500, "swing");
    return false;
  });
})();
