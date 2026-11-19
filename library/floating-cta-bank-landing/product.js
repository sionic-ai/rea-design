// Product list only — banner slider (original main.js .m-slide: slick autoplay 4000 · one slide at a time · dots · arrows, control row hidden with a single slide, ‹Pause› toggles slickPause/slickPlay)
(() => {
  const start = () => {
    if (!window.jQuery || !jQuery.fn.slick) return;
    const $ = jQuery;
    $(".js-slide").each(function () {
      const box = $(this);
      const list = box.find(".nb-slide__main");
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let playing = !reduce;
      list.on("init", () => box.addClass("is-ready"));
      list.slick({
        autoplay: playing,
        autoplaySpeed: 4000,
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: true,
        appendDots: box.find(".nb-slide__dots"),
        appendArrows: box,
        prevArrow: '<div class="m-slide-prev"><button type="button" aria-label="Previous">Previous</button></div>',
        nextArrow: '<div class="m-slide-next"><button type="button" aria-label="Next">Next</button></div>',
      });
      if (list.children().length < 2) box.find(".nb-slide__nav").hide();
      box.find(".js-slide-stop").on("click", function () {
        playing = !playing;
        list.slick(playing ? "slickPlay" : "slickPause");
        $(this).toggleClass("is-restart", !playing).text(playing ? "Stop" : "Play");
      });
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
