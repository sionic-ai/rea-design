// Home page slick — same version (1.9.0) and same options as the original. Reading and category rows become drag-to-swipe only at 1000px and below.
$(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  $(".br-colList__item .br-colList__ttl").matchHeight();
  $(".br-colList__item .br-colList__info").matchHeight();

  $(".br-rec__list").slick({
    dots: true,
    arrows: true,
    autoplay: !reduce,
    infinite: true,
    speed: reduce ? 0 : 500,
    centerMode: true,
    slidesToShow: 7,
    variableWidth: true,
    pauseOnFocus: true,
    pauseOnHover: true,
  });

  $(".br-spRank").slick({
    dots: true,
    arrows: false,
    autoplay: false,
    infinite: false,
    speed: reduce ? 0 : 500,
    variableWidth: true,
    pauseOnFocus: false,
    pauseOnHover: false,
  });

  $(".br-ban__list").slick({
    dots: true,
    arrows: true,
    autoplay: !reduce,
    infinite: true,
    speed: reduce ? 0 : 500,
    centerMode: true,
    variableWidth: true,
    pauseOnFocus: true,
    pauseOnHover: true,
  });

  const narrow = () => {
    if (window.innerWidth <= 1000) {
      $(".br-topCol__list, .br-intro__list").not(".slick-initialized").slick({
        dots: false,
        arrows: false,
        autoplay: false,
        infinite: true,
        speed: reduce ? 0 : 500,
        variableWidth: true,
        pauseOnFocus: false,
        pauseOnHover: false,
      });
    } else {
      $(".br-topCol__list.slick-initialized, .br-intro__list.slick-initialized").slick("unslick");
    }
  };
  $(window).on("resize", narrow);
  narrow();
});
