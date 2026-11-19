// Sub page motion — same values as the original column/js, categorySlider.js and stay/js
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reading list hero — centered · 1s · 4s autoplay · dots (clickable) · gap 24 at 768 and up
  if (window.Swiper && document.querySelector(".mt-top-swiper")) {
    new Swiper(".mt-top-swiper", {
      slidesPerView: "auto", centeredSlides: true, speed: 1000, spaceBetween: 8, loop: true, allowTouchMove: true,
      autoplay: reduce ? false : { delay: 4000 },
      pagination: { el: ".mt-pager", clickable: true },
      breakpoints: { 768: { spaceBetween: 24 } },
    });
  }
  // Category strip — flows nonstop one slot per 5s (delay 0, can’t be stopped by hand)
  if (window.Swiper && document.querySelector(".mt-cats__swiper")) {
    new Swiper(".mt-cats__swiper", {
      slidesPerView: "auto", speed: 5000, spaceBetween: 6, loop: true, allowTouchMove: false,
      autoplay: reduce ? false : { delay: 0, disableOnInteraction: false },
    });
  }

  // Room photos — slick fade (.3s). In the original, one progress bar’s timer drives every advance together: every 30ms 1/1.3 % → next at 3.9s
  const $ = window.jQuery;
  if ($ && $.fn.slick && $(".mt-slick").length) {
    const sliders = $(".mt-slick");
    sliders.slick({ dots: false, centerMode: false, arrows: true, infinite: true, speed: 300, slidesToShow: 1, fade: true, adaptiveHeight: false });
    const bars = $(".mt-progress i");
    let pct = 0, timer = 0;
    const tick = () => { pct += 1 / (1 + 0.3); bars.css({ width: pct + "%" }); if (pct >= 100) { sliders.slick("slickNext"); start(); } };
    const start = () => { bars.css({ width: "0%" }); clearInterval(timer); pct = 0; if (!reduce) timer = setInterval(tick, 30); };
    sliders.on("swipe", start);
    sliders.find(".slick-arrow").on("click", start);
    $(".mt-slick-wrap").each(function () {
      const wrap = $(this), n = wrap.find(".mt-slick .wf-img").not(".slick-cloned").length;
      wrap.find(".mt-count__now").text("01");
      wrap.find(".mt-count__all").text("0" + n);
      wrap.find(".mt-thumbs button").first().addClass("is-active");
      wrap.find(".mt-thumbs button").each(function (i) { $(this).on("click", () => { wrap.find(".mt-slick").slick("slickGoTo", i); start(); }); });
    });
    sliders.on("afterChange", function (e, slick, cur) {
      const wrap = $(this).closest(".mt-slick-wrap");
      wrap.find(".mt-count__now").text("0" + (cur + 1));
      wrap.find(".mt-thumbs button").removeClass("is-active").eq(cur).addClass("is-active");
    });
    start();
  }

  // FAQ — tap to flip ＋ to －, the answer opens with jQuery toggle(200)
  if ($) {
    $(".mt-faq__item").on("click", function () {
      $(this).find(".mt-faq__btn").toggleClass("open");
      $(this).find(".mt-faq__a").stop().toggle(reduce ? 0 : 200);
    });
  }
})();
