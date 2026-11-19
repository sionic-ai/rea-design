// Original header script kept — scroll up gives top 0, scroll down (same spot included) −40px, hand over gives 0, hand off −40px. The phone menu only opens and closes
jQuery(($) => {
  const $head = $(".pl-head");
  let scroll = 0;
  $(window).on("scroll", function () {
    if ($(this).scrollTop() < scroll) $head.css("top", "0px");
    else $head.css("top", "-40px");
    scroll = $(this).scrollTop();
  });
  $head.hover(() => $head.css("top", "0px"), () => $head.css("top", "-40px"));

  $(".pl-openbtn").on("click", function () {
    $(this).toggleClass("is-active");
    $(".pl-burger").toggleClass("is-active");
  });
  $(".pl-burger a").on("click", () => {
    $(".pl-openbtn").removeClass("is-active");
    $(".pl-burger").removeClass("is-active");
  });
});
