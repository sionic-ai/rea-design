// Original home.js — the product strip is slick (.3s, pressing next at the end returns to the start), arrows·dots are moved to a control row below the strip. The hero pair hover · three-times-on is the pair-swap-hover part
jQuery(($) => {
  const $slider = $(".pc-slider");
  $slider.slick({ speed: 300, pauseOnFocus: false, pauseOnHover: false, dots: true, arrows: true, variableWidth: true });
  $(".slick-next").on("click", function () {
    if ($(this).hasClass("slick-disabled")) $slider.slick("slickGoTo", 0);
  });
  const dock = () => {
    $slider.find(".slick-prev, .slick-next, .slick-dots").appendTo(".pc-pcontrol");
  };
  dock();
  $(window).on("load resize", dock);
});
