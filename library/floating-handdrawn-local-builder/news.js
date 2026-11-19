(function ($) {
  // On phone only the current category shows, and tapping expands the rest
  const setup = () => {
    const $cat = $(".category"), $items = $cat.find("li");
    if ($(window).width() <= 767) {
      $items.not(".current").hide();
      $cat.off("click").on("click", "li.current a", (e) => { e.preventDefault(); $items.not(".current").toggle(); $cat.toggleClass("is-open"); });
    } else {
      $cat.off("click"); $items.show(); $cat.removeClass("is-open");
    }
  };
  $(setup);
  $(window).on("resize", setup);
})(jQuery);
