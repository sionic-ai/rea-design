// Achievements slider: same slick 1.6.0 values as the original — infinite, variable cell width, one step every 4000ms taking 600ms, round arrows, no arrows below 767px
$(".dwk__track").slick({
  dots: false,
  arrows: true,
  infinite: true,
  slidesToShow: 2,
  slidesToScroll: 1,
  speed: 600,
  centerMode: false,
  variableWidth: true,
  autoplay: !lwMotion.reduce,
  autoplaySpeed: 4000,
  pauseOnHover: false,
  responsive: [{ breakpoint: 767, settings: { slidesToShow: 1, arrows: false } }],
});
