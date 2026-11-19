// As in the original, past 750px of scroll the pinned photo is set down at the bottom of the About block (-100px), and scrolling back above it pins it to the top right of the screen again.
(() => {
  const $ = window.jQuery;
  $(window).on("scroll", () => {
    const $pic = $(".dm-about-photo");
    if ($(window).width() > 768) {
      if (window.pageYOffset > 750) $pic.css({ position: "absolute", top: "inherit", bottom: -100 });
      else $pic.css({ position: "fixed", top: 0, bottom: "inherit" });
    } else {
      $pic.css({ position: "inherit", top: "inherit", bottom: "inherit" });
    }
  });
})();
