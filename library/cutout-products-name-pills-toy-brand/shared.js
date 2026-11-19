// Values exactly from the original common.js — back to top (past 100px jQuery fadeIn 400ms swing, rests above the footer when touching it) · phone menu panel fade · AOS
jQuery(($) => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) $.fx.off = true;
  const $top = $(".pc-top"), $side = $(".pc-side");

  $(window).on("load scroll", function () {
    if ($(this).scrollTop() > 100) $top.fadeIn();
    else $top.fadeOut();
    const footH = $(".pc-foot").innerHeight();
    const pos = $(window).height() + $(window).scrollTop();
    if ($(document).height() - pos <= footH - 70) {
      $top.css({ position: "absolute", bottom: footH - 20 });
      $side.css({ position: "absolute", bottom: footH - 20 });
    } else {
      $top.css({ position: "fixed", bottom: "45px" });
      $side.css({ position: "fixed", bottom: "40px" });
    }
  });

  let open = false;
  const close = () => {
    $(".pc-toggle").removeClass("is-active");
    $(".pc-logo").fadeIn();
    $(".pc-spmenu").fadeOut().removeClass("is-open");
    $top.removeClass("is-hide");
    open = false;
  };
  $(".pc-toggle").on("click", () => {
    if (open) return close();
    $(".pc-toggle").addClass("is-active");
    $(".pc-logo").fadeOut();
    $(".pc-spmenu").fadeIn().addClass("is-open");
    $top.addClass("is-hide");
    open = true;
  });
  $(".pc-spmenu a").on("click", () => open && close());
  $(window).on("resize", () => { if ($(window).width() > 900 && open) close(); });

  // The original passed anchor to init, but AOS 2.3 has no global setting by that name, so it runs on the defaults (top-bottom · offset 120) — the same init is kept as is
  AOS.init({ once: true, duration: 500, easing: "ease-in-out", anchor: "center-bottom", disable: reduce });
});
