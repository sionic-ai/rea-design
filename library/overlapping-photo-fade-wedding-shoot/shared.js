// Used by all pages — with the same libraries as the original: phone menu drawer (jquery-drawer 3.1.0 + iScroll 5.2.0),
// Hero height fit, plan text box height match (jquery-match-height 0.7.2), hero photo fade (Swiper 11.2.10)
(() => {
  if (typeof jQuery === "undefined") return;
  const $ = jQuery;
  $(() => {
    const $win = $(window);
    const fit = () => $(".js-fullheight").css("height", $win.height());
    fit();
    $win.on("resize", fit);

    if ($(".drawer").length) {
      $(".drawer").drawer();
      $(".drawer-menu a").on("click", () => $(".drawer").drawer("close"));
    }
    $(document).on("click", ".drawer-toggle", () => $("html, body").toggleClass("fixed"));

    if ($.fn.matchHeight) $(".match-ttl").matchHeight();

    if (typeof Swiper !== "undefined" && document.querySelector(".sv-mv .swiper")) {
      new Swiper(".sv-mv .swiper", { loop: true, speed: 3000, autoplay: { delay: 3000 }, effect: "fade", fadeEffect: { crossFade: true } });
    }
  });
})();
