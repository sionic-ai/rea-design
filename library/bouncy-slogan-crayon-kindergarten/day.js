// Daily flow: each box has a mini photo slider — same Swiper build and settings as the original miniswiper (crossFade · loop · drag to swipe · click dots to navigate · .7s)
(() => {
  document.querySelectorAll(".mswiper .swiper").forEach((el) => {
    // Even a single slide keeps one dot like the original — loop is turned off automatically by Swiper when there are too few slides
    new Swiper(el, {
      effect: "fade",
      fadeEffect: { crossFade: true },
      loop: el.querySelectorAll(".swiper-slide").length > 1,
      slidesPerView: 1,
      grabCursor: true,
      pagination: { el: el.querySelector(".swiper-pagination"), clickable: true },
      speed: 700,
    });
  });
})();
