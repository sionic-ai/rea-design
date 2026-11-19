// Two slick sliders on the first page — original common.js settings as they are.
// Hero: fade · speed 950 · autoplay 2500 · no arrows or dots · no dragging · does not pause on hover or focus. Thumbnail circles switch on the next slide in beforeChange, and clicking goes to that slide.
// Social feed: arrows · autoplay (default 3s · .3s) · 4 slots (2 below 960, advance 2 at a time below 560).
(() => {
  const $ = window.jQuery;
  if (!$ || !$.fn.slick) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $main = $(".mk-hero__slider");
  const thumbs = [...document.querySelectorAll(".mk-hero__thumb")];
  $main.on("beforeChange", (e, slick, current, next) => thumbs.forEach((t, i) => t.classList.toggle("is-active", i === next)));
  $main.slick({ fade: true, speed: 950, autoplay: !reduce, autoplaySpeed: 2500, arrows: false, dots: false, infinite: true, swipe: false, pauseOnHover: false, pauseOnFocus: false, pauseOnDotsHover: false });
  thumbs[0]?.classList.add("is-active");
  thumbs.forEach((t, i) => t.addEventListener("click", () => $main.slick("slickGoTo", i)));

  $(".mk-insta__slider").slick({
    arrows: true, dots: false, autoplay: !reduce, slidesToShow: 4, slidesToScroll: 1,
    responsive: [{ breakpoint: 960, settings: { slidesToShow: 2 } }, { breakpoint: 560, settings: { slidesToShow: 2, slidesToScroll: 2, arrows: true } }],
  });
})();
