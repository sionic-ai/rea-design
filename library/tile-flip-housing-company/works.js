// Project cases — like the original, the search panel opens and closes with jQuery slideToggle(300), and the side list has a simplebar scrollbar (always visible)
jQuery(($) => {
  $(".js-toggle-cnt").hide();
  $(".js-toggle-btn").on("click", function () {
    $(this).next(".js-toggle-cnt").slideToggle(300, () => window.ScrollTrigger && ScrollTrigger.refresh());
    $(this).toggleClass("is-active");
  });
});
