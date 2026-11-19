// Original About page — clicking the special video cover removes the cover and plays (original uses a video player), and the phone cast intro is a modal with the body fixed in place
jQuery(($) => {
  const overlay = document.getElementById("pl-overlay"), video = document.getElementById("pl-player-video");
  overlay?.addEventListener("click", () => {
    overlay.classList.add("is-none");
    video?.play().catch(() => {});
  });
  let pos = 0;
  $(".pl-modal-open").on("click", function () {
    pos = $(window).scrollTop();
    $("body").addClass("is-fixed").css({ top: -pos });
    $("#" + $(this).data("target")).css("display", "block");
    $(".pl-sp-players .is-gray").addClass("is-on");
    return false;
  });
  $(".pl-modal-bg").on("click", () => {
    $("body").removeClass("is-fixed").css({ top: "" });
    window.scrollTo(0, pos);
    $(".pl-modal").css("display", "none");
    $(".pl-sp-players .is-gray").removeClass("is-on");
    return false;
  });
});
