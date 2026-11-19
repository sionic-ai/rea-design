// Thumbnail circle fade slider — the original (common.js) is a slick fade (speed 950 · autoplay 2500, no arrows · dots · drag,
// …not stopped by hand or focus) a thumbnail slick is tied in with asNavFor, and beforeChange lights up the next slide’s thumbnail. Hung on the same slick,
// Thumbnails are received as buttons and pressing one goes to that slide (same as asNavFor’s focusOnSelect).
(() => {
  kfFx.register("thumb-fade-slider", (el, { options, reduce }) => {
    const $ = window.jQuery;
    const track = el.querySelector('[data-fx-part="slides"]');
    if (!$ || !$.fn || !$.fn.slick || !track || !track.children.length) return;
    const thumbs = [...el.querySelectorAll('[data-fx-part="thumb"]')];
    const $track = $(track);
    const onBefore = (e, slick, current, next) => thumbs.forEach((t, i) => t.classList.toggle("is-active", i === next));
    $track.on("beforeChange", onBefore);
    $track.slick({
      fade: true, speed: +(options.speed ?? 950), autoplay: !reduce, autoplaySpeed: (+(options.every ?? 2.5) || 2.5) * 1000,
      arrows: false, dots: false, infinite: true, swipe: false, pauseOnHover: false, pauseOnFocus: false, pauseOnDotsHover: false,
    });
    thumbs[0]?.classList.add("is-active");
    const go = thumbs.map((t, i) => { const f = () => $track.slick("slickGoTo", i); t.addEventListener("click", f); return f; });
    return () => {
      thumbs.forEach((t, i) => { t.removeEventListener("click", go[i]); t.classList.remove("is-active"); });
      $track.off("beforeChange", onBefore);
      if (track.classList.contains("slick-initialized")) $track.slick("unslick");
    };
  });
})();
