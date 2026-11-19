// Office photo band: same slick 1.6.0 values as the original — speed 9000ms·auto 0ms·linear flows one slide at a time without breaks and isn’t dragged by hand
$(".ol__track").slick({
  dots: false,
  arrows: false,
  infinite: true,
  speed: 9000,
  centerMode: false,
  slidesToShow: 3,
  variableWidth: true,
  autoplay: !lwMotion.reduce,
  autoplaySpeed: 0,
  cssEase: "linear",
  pauseOnHover: false,
  pauseOnFocus: false,
  touchMove: false,
  swipe: false,
});
