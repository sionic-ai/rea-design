// Hero photo fade (1.5s · auto 5.5s) and horizontal slider (600ms) — same Swiper 8.4.7 as the original, same settings
(() => {
  addEventListener("load", () => {
    new Swiper(".p-index-hero .swiper", { effect: "fade", fadeEffect: { crossFade: false }, loop: true, loopAdditionalSlides: 1, speed: 1500, autoplay: { delay: 5500, disableOnInteraction: false, waitForTransition: true }, followFinger: false });
  });
  document.querySelectorAll(".basic-swiper").forEach((el) => {
    new Swiper(el, { slidesPerView: "auto", speed: 600, navigation: { nextEl: el.querySelector(".swiper-button-next"), prevEl: el.querySelector(".swiper-button-prev") }, scrollbar: { el: el.querySelector(".swiper-scrollbar"), draggable: true }, threshold: 10 });
  });
})();
