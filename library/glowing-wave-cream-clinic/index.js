// First page — hero fade slide, banner slider (original values as is), hero timetable
(() => {
  document.querySelectorAll("[data-tbl]").forEach((el) => { el.innerHTML = window.aaTable(el.dataset.tbl); });

  const mv = document.querySelector(".aa-mv__slide");
  if (mv) {
    new Swiper(mv, { effect: "fade", speed: 2000, slidesPerView: 1, spaceBetween: 0, threshold: 3, allowTouchMove: false, autoplay: { delay: 3700, disableOnInteraction: false } });
    mv.classList.add("is-fade");
  }
  const vp = document.querySelector(".aa-tb__vp");
  if (vp) new Swiper(vp, {
    loop: true, loopAdditionalSlides: 2, spaceBetween: 10, slidesPerView: 1, threshold: 30,
    autoplay: { delay: 5000, disableOnInteraction: false },
    pagination: { el: ".aa-tb__pg", clickable: true },
    navigation: { nextEl: ".aa-tb__nav.is-next", prevEl: ".aa-tb__nav.is-prev" },
    breakpoints: { 768.98: { spaceBetween: 30, slidesPerView: 2, loopAdditionalSlides: 1 } },
  });
})();
