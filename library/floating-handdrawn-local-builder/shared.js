(function ($) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The hero gets is-show once the window is fully loaded, other sections when the section’s top edge crosses the 1/5 line from the bottom of the screen — removed again on scrolling back up like the original
  $(window).on("load", () => $(".onload").addClass("is-show"));
  if (document.readyState === "complete") $(".onload").addClass("is-show");
  const check = () => {
    const y = $(window).scrollTop(), h = $(window).height();
    $(".scroll").each(function () {
      $(this).toggleClass("is-show", reduce || y > $(this).offset().top - h + h / 5);
    });
  };
  $(window).on("scroll", check);
  $(check);

  // Menu — the green button at top right opens and closes the screen-covering menu panel with fadeToggle(400ms), and stops background scroll while open
  let open = false, pos = 0;
  const $head = $(".ej-head"), $btn = $(".ej-trigger"), $menu = $(".ej-menu"), $txt = $(".ej-trigger__txt");
  const toggle = () => {
    if (!open) {
      pos = $(window).scrollTop();
      $("body").addClass("is-fixed").css({ top: -pos });
      $head.addClass("is-open");
      $txt.text("CLOSE");
    } else {
      $("body").removeClass("is-fixed").css({ top: 0 });
      window.scrollTo(0, pos);
      $head.removeClass("is-open");
      $txt.text("OPEN");
    }
    $menu.stop(true, true).fadeToggle(reduce ? 0 : 400);
    open = !open;
    $btn.attr("aria-expanded", open);
  };
  $btn.on("click", toggle);
  $menu.on("click", "a", () => { if (open) toggle(); });
  $(window).on("resize", () => {
    if (window.innerWidth > 767 && open) { $("body").removeClass("is-fixed").css({ top: 0 }); }
  });

  // Same-page anchor · back to top — 500ms
  $(document).on("click", 'a[href^="#"]', function (e) {
    const id = this.getAttribute("href");
    const y = id.length > 1 && $(id).length ? $(id).offset().top : 0;
    e.preventDefault();
    $("html, body").stop().animate({ scrollTop: y }, reduce ? 0 : 500);
  });
})(jQuery);
