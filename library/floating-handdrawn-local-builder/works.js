(function ($) {
  // Narrow by design/style — click and the tag list does slideToggle(400ms)
  $(".ej-wsrch__wrap").hide();
  $(".ej-wsrch__ttl").on("click", function () {
    $(".ej-wsrch__wrap").stop(true, true).slideToggle();
    $(this).toggleClass("is-open").attr("aria-expanded", $(this).hasClass("is-open"));
  });
})(jQuery);
