// People swiper — original settings as is (Swiper 12 · slides per width · speed 1000 · free drag · inertia 2× · prev/next · keyboard)
(() => {
  if (!window.Swiper) return;
  document.querySelectorAll("[data-swiper-group]").forEach((group) => {
    const wrap = group.querySelector("[data-swiper-wrap]");
    if (!wrap) return;
    new Swiper(wrap, {
      slidesPerView: 1,
      speed: 1000,
      mousewheel: false,
      grabCursor: true,
      freeMode: true,
      momentumRatio: 2,
      spaceBetween: 16,
      breakpoints: { 393: { slidesPerView: 1 }, 430: { slidesPerView: 1.5 }, 768: { slidesPerView: 3.5 }, 992: { slidesPerView: 4 } },
      navigation: { nextEl: group.querySelector("[data-swiper-next]"), prevEl: group.querySelector("[data-swiper-prev]") },
      keyboard: { enabled: true, onlyInViewport: false },
    });
  });
})();
