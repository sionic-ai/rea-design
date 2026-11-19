// Like the original, it runs on jQuery 2.2.0 + jquery-inview — the loader lift and body brighten use the jQuery animate(swing) values as-is, so they are not swapped for GSAP curves.
(() => {
  const $ = window.jQuery;
  const mm = gsap.matchMedia();
  let reduce = false;
  mm.add({ ok: "(prefers-reduced-motion: no-preference)", rm: "(prefers-reduced-motion: reduce)" }, (ctx) => { reduce = ctx.conditions.rm; });

  const isHome = document.body.dataset.page === "home";
  const wide = () => $(window).width() > 768;

  const closeMenu = () => {
    $(".dm-btn-menu").removeClass("active");
    $(".dm-menu").removeClass("active").addClass("noActive");
    $(".dm-main").removeClass("open");
    $("body").css("overflow", "auto");
    setTimeout(() => { $(".dm-menu").css("display", "none"); }, 500);
  };

  $(window).on("load", () => {
    if (isHome && !reduce) {
      $(".dm-loading").css("display", "flex").delay(3400).fadeOut(300);
      if (wide()) {
        setTimeout(() => { $(".dm-main").stop().animate({ opacity: "1" }, 2000); }, 3600);
        setTimeout(() => { $("header").stop().animate({ opacity: "1" }, 300); }, 4200);
      } else {
        setTimeout(() => { $(".dm-hero-slide").stop().animate({ opacity: "1" }, 300); }, 4200);
        setTimeout(() => { $(".dm-hero-sp p").addClass("on"); }, 4700);
        setTimeout(() => { $("header").stop().animate({ opacity: "1" }, 300); }, 3600);
      }
      setTimeout(() => { $("body").removeClass("is-hold"); }, 3600);
      $(".dm-menu .shopAnker a").on("click", closeMenu);
      if (wide()) $(".dm-logo").css("display", "none");
    } else {
      $(".dm-main, header, .dm-hero-slide").css("opacity", 1);
      $(".dm-hero-sp p").addClass("on");
      $("body").removeClass("is-hold");
      if (isHome) {
        $(".dm-menu .shopAnker a").on("click", closeMenu);
        if (wide()) $(".dm-logo").css("display", "none");
      } else {
        $(".dm-btn-menu").on("click", function () {
          if ($(this).hasClass("active")) $(".dm-logo").fadeOut();
          else $(".dm-logo").fadeIn();
        });
      }
    }
  });

  $(() => {
    $(".in_view").on("inview", function (event, isInView) {
      if (isInView) $(this).addClass("on");
    });

    // Korean web fonts load late in chunks per glyph group, so unless the hidden menu text is preloaded, line width changes late on first open
    if (document.fonts) {
      const text = $(".dm-menu").text().replace(/\s+/g, "");
      const fam = getComputedStyle(document.documentElement).getPropertyValue("--kf-font-sans");
      ["500 16px", "400 12px"].forEach((f) => document.fonts.load(`${f} ${fam}`, text).catch(() => {}));
    }

    $(".dm-btn-menu").on("click", function () {
      if ($(this).hasClass("active")) {
        closeMenu();
      } else {
        $(this).addClass("active");
        $(".dm-menu").addClass("active").removeClass("noActive");
        $(".dm-main").addClass("open");
        $("body").css("overflow", "hidden");
        const w = $(window).width();
        $(".dm-menu").css("display", w > 929 ? "flex" : w > 639 ? "block" : "flex");
      }
    });
  });
})();
