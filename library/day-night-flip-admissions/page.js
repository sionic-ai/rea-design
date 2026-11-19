// University main campus first page — the original share.js bxSlider settings and timer as-is (jQuery animate · 8s auto advance · white veil on adjacent slides 600ms)
$(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sp = matchMedia("(max-width: 767px)").matches;
  const speed = reduce ? 0 : 500;

  // Original loads jquery.easing 1.3 and swaps the default curve swing for easeOutQuad — fades and slides all use this curve
  $.easing.swing = (p) => p * (2 - p);

  // All links (except .rover such as target menus·tabs) fade to .6 on hover — the original is fadeTo("600") given as a string, so it becomes the jQuery default 400ms.
  // Does not hook page-number buttons that the slider creates later (the original also hooks before the slider)
  if (!sp) {
    // Language has a separate dropdown panel, and the text does not fade (measured on the original, that’s how it is)
    $("a").not(".pt-lang-link").on("mouseenter", function () { if (!$(this).hasClass("rover")) $(this).stop().fadeTo(reduce ? 0 : 400, 0.6); })
      .on("mouseleave", function () { if (!$(this).hasClass("rover")) $(this).stop().fadeTo(reduce ? 0 : 400, 1); });
  }
  $("[data-find-open]").on("click", (e) => { e.preventDefault(); $("[data-find]").stop().fadeIn(reduce ? 0 : 600); });
  $("[data-find-close]").on("click", (e) => { e.preventDefault(); $("[data-find]").stop().fadeOut(reduce ? 0 : 300); });

  // White curtain: after all images are loaded (originally the first slider image imagesLoaded), it lifts over 1s on the next frame and is removed 1s later
  const veil = $("[data-veil]");
  const lift = () => requestAnimationFrame(() => {
    veil.addClass("is-fade");
    setTimeout(() => veil.addClass("is-off"), reduce ? 0 : 1000);
  });
  if (document.readyState === "complete") lift(); else $(window).on("load", lift);

  // ── Big slider: the last cell is attached in front so the middle of three is the current cell. Only the current cell lifts its curtain, then next after 8s ──
  const $mv = $(".pt-mv__slider");
  $mv.prepend($mv.children("li").last());
  let timer = 0;
  const center = (s) => (sp ? s.getCurrentSlide() : (s.getCurrentSlide() + 1) % s.getSlideCount());
  const covers = (s) => {
    const on = center(s);
    $mv.children("li").not(".bx-clone").each(function (i) {
      const c = $(this).find(".pt-mv__cover");
      if (i === on) c.stop(true, false).fadeOut(reduce ? 0 : 600);
      else c.stop(true, false).fadeIn(reduce ? 0 : 600);
    });
  };
  const later = (s) => { clearTimeout(timer); if (!reduce) timer = setTimeout(() => s.goToNextSlide(), 8000); };
  const mv = $mv.bxSlider({
    slideWidth: sp ? 0 : 990, minSlides: sp ? 1 : 3, maxSlides: sp ? 1 : 3, moveSlides: 1, slideMargin: 0, startSlide: 0,
    useCSS: false, touchEnabled: true, pager: true, controls: false, infiniteLoop: true, speed,
    onSliderLoad() { covers(this); later(this); },
    onSlideBefore() { clearTimeout(timer); },
    onSlideAfter() { covers(this); later(this); },
  });
  $("[data-mv-prev]").on("click", () => mv.goToPrevSlide());
  $("[data-mv-next]").on("click", () => mv.goToNextSlide());
  $(".pt-mv__slider a").on("mouseenter", function () { $(this).stop(true, false).fadeTo(reduce ? 0 : 600, 0.6); })
    .on("mouseleave", function () { $(this).stop(true, false).fadeTo(reduce ? 0 : 300, 1); });

  // Pages of three or five are swapped with a fade (stops at the ends) — the prev and next buttons dim at the ends
  const fadeSlider = ($list, $prev, $next) => {
    const n = $list.children("li").length;
    const mark = (s) => {
      const i = s.getCurrentSlide();
      $prev.toggleClass("is-disabled", i === 0);
      $next.toggleClass("is-disabled", i === n - 1);
    };
    const s = $list.bxSlider({
      mode: "fade", slideWidth: 4000, minSlides: 1, maxSlides: 1, moveSlides: 1, slideMargin: 0, adaptiveHeight: true,
      useCSS: false, touchEnabled: false, pager: true, controls: false, infiniteLoop: false, speed,
      onSliderLoad() { mark(this); }, onSlideAfter() { mark(this); },
    });
    $prev.on("click", (e) => { e.preventDefault(); s.goToPrevSlide(); });
    $next.on("click", (e) => { e.preventDefault(); s.goToNextSlide(); });
    return s;
  };
  fadeSlider($(".pt-award__slider"), $("[data-aw-prev]"), $("[data-aw-next]"));
  const news = [];
  $(".pt-news__panel").each(function () {
    const $p = $(this);
    $p.addClass("is-cur");
    news.push(fadeSlider($p.find(".pt-news__slider"), $p.find("[data-prev]"), $p.find("[data-next]")));
    $p.toggleClass("is-cur", $p.data("news") === 0);
  });
  $(".pt-news__tabs button").on("click", function () {
    const i = $(this).data("tab");
    $(".pt-news__tabs button").removeClass("is-cur");
    $(this).addClass("is-cur");
    $(".pt-news__panel").removeClass("is-cur").filter(`[data-news="${i}"]`).addClass("is-cur");
    news[i]?.redrawSlider();
  });

  // ── Phone menu button: press to expand the panel (.2s), press outside to close ──
  const $mega = $("[data-mega-panel]");
  $("[data-mega-toggle]").on("click", (e) => { e.preventDefault(); e.stopPropagation(); $mega.toggleClass("is-open"); });
  $(document).on("click", (e) => { if (!$(e.target).closest("[data-mega-panel]").length) $mega.removeClass("is-open"); });

  $("[data-top]").on("click", (e) => { e.preventDefault(); $("html, body").animate({ scrollTop: 0 }, reduce ? 0 : 500); });
});
