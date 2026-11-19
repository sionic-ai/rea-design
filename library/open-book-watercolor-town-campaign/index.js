// Swiper 8.4.7 two rows — same settings as the original
(() => {
  if (typeof Swiper === "undefined") return;
  new Swiper(".ot-slide01", {
    loop: true,
    slidesPerView: 1.5,
    spaceBetween: 16,
    centeredSlides: true,
    pagination: { el: ".ot-slide01-pagination", type: "fraction" },
    navigation: { nextEl: ".ot-slide01-next", prevEl: ".ot-slide01-prev" },
    breakpoints: { 768: { slidesPerView: 4.2, spaceBetween: 40 } },
  });
  new Swiper(".ot-slide02", {
    loop: true,
    slidesPerView: 1,
    pagination: { el: ".ot-slide02-pagination", type: "fraction" },
    navigation: { nextEl: ".ot-slide02-next", prevEl: ".ot-slide02-prev" },
  });
})();
