/* Careers — original slick band (8s linear seamless, 2.5 slides) and 3-slide slider (only above 641px), floating apply button once the hero has fully scrolled away */
(() => {
  const $ = window.jQuery;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  $(".ticker__list").slick({
    arrows: false, dots: false, autoplay: !reduce, autoplaySpeed: 0, speed: 8000, cssEase: "linear",
    slidesToShow: 2.5, slidesToScroll: 1, infinite: true, pauseOnFocus: false, pauseOnHover: false, swipe: false,
    responsive: [{ breakpoint: 768, settings: { slidesToShow: 1.5 } }],
  });
  const sliders = () => {
    $("[data-r-slider]").each(function () {
      const $s = $(this), on = $s.hasClass("slick-initialized"), arrows = $s.next(".r-arrows");
      if (innerWidth > 640) {
        if (!on) {
          $s.slick({ infinite: true, slidesToShow: 3, slidesToScroll: 1, arrows: true, prevArrow: arrows.find(".prev-arrow"), nextArrow: arrows.find(".next-arrow"), responsive: [{ breakpoint: 768, settings: { slidesToShow: 1.5, arrows: false } }] });
          arrows.show();
        }
      } else if (on) { $s.slick("unslick"); arrows.hide(); }
    });
  };
  sliders();
  let t;
  $(window).on("resize", () => { clearTimeout(t); t = setTimeout(sliders, 200); });

  // Hide when even 10% of the hero is visible, show when it is fully gone
  const fv = document.querySelector("[data-fv]"), fl = document.querySelector(".r-float");
  new IntersectionObserver((es) => es.forEach((e) => fl.classList.toggle("is-visible", !e.isIntersecting)), { threshold: 0.1 }).observe(fv);

  // FAQ accordion — click to slideToggle
  $(".faq__item dt").on("click", function () { $(this).toggleClass("on").next().stop(true).slideToggle(); });
})();
