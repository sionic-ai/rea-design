// Work detail — the capture row is the same Swiper as the original: horizontal · 1 slide per move · 3.5 slides visible · 5% gap · grab hand · pressing a slide goes to it (speed default 300ms)
(() => {
  const el = document.querySelector("[data-swiper]");
  if (!el || !window.Swiper) return;
  new Swiper(el, { direction: "horizontal", slidesPerGroup: 1, slidesPerView: 3.5, centeredSlides: false, spaceBetween: "5%", grabCursor: true, slideToClickedSlide: true });
})();
