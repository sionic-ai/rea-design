// Careers section: photo slider — as in the original Swiper slidesPerView auto · speed 500 · round prev and next buttons (opacity 0 at the ends)
(() => {
  document.addEventListener("mm:ready", () => {
    document.querySelectorAll(".rsl__slider").forEach((box) => {
      new Swiper(box.querySelector(".rsl__swiper"), {
        slidesPerView: "auto",
        speed: 500,
        navigation: { nextEl: box.querySelector(".swiper-button-next"), prevEl: box.querySelector(".swiper-button-prev") },
      });
    });
  });
})();
