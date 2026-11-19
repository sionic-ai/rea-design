// Region shortcut — as in the original, after 50ms subtract the header height and jQuery animate 500ms (swing)
jQuery(($) => {
  $('a[href^="#"]').on("click", function (e) {
    const t = $($(this).attr("href"));
    if (!t.length) return;
    e.preventDefault();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
    setTimeout(() => $("html, body").animate({ scrollTop: t.offset().top - ($(".js-header").outerHeight() || 0) }, 500), 50);
  });
});
