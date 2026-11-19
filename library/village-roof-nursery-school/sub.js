// Subpage — photo gallery bubble panel Swiper (fade 1s·5s·Back/Next), fading in the next batch when the list end is reached (original ajax infinite loading —
// The copy attaches the same bundle once more: News after 1s with a 2s fade, photos after 2s with a 1s fade), the original-sentence art inside text
(() => {
  const $ = window.jQuery;
  const { reduce, emblem } = OM;

  document.querySelectorAll("[data-emblem]").forEach((el) => { el.outerHTML = emblem; });

  if (window.Swiper && document.querySelector(".om-photomv__swiper")) {
    new Swiper(".om-photomv__swiper", {
      navigation: { nextEl: ".om-photomv__btn .swiper-button-next", prevEl: ".om-photomv__btn .swiper-button-prev" },
      loop: true, effect: "fade", speed: 1000, autoplay: reduce ? false : { delay: 5000, disableOnInteraction: false },
    });
  }

  const list = document.querySelector(".om-news-items, .om-photolist");
  if (!list || !$) return;
  const isPhoto = list.classList.contains("om-photolist");
  const loader = $(".om-loading-more");
  let done = false;
  addEventListener("scroll", () => {
    if (done) return;
    const foot = document.querySelector(".om-footer");
    if (!foot || innerHeight + scrollY < foot.getBoundingClientRect().top + scrollY) return;
    done = true;
    loader.fadeIn();
    setTimeout(() => {
      const more = $(list).children().slice(0, isPhoto ? 4 : 5).clone().attr("data-scroll", "in");
      more.hide().appendTo(list).fadeIn(reduce ? 0 : isPhoto ? 1000 : 2000);
    }, isPhoto ? 2000 : 1000);
    loader.fadeOut(2000);
  }, { passive: true });
})();
