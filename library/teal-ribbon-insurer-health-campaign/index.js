// First page only — teal section 3-slot carousel (original Swiper: 1 phone slide, 3 at 960 and above, 30px gap, .5s, drag, keyboard, arrows)
(() => {
  const start = () => {
    const box = document.querySelector(".js-c3");
    if (!box || !window.Swiper) return;
    const wrap = box.closest(".my-c3");
    new Swiper(box, {
      grabCursor: true,
      speed: 500,
      slidesPerView: 1,
      spaceBetween: 30,
      navigation: { nextEl: wrap.querySelector(".swiper-button-next"), prevEl: wrap.querySelector(".swiper-button-prev") },
      keyboard: { enabled: true },
      breakpoints: { 960: { slidesPerView: 3 } },
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
