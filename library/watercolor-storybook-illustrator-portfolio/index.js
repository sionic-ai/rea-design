// Desk gallery slider — same Swiper settings as the original script_index.js (endless·auto 3s·transition .5s·gap 40px·grab cursor)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  new Swiper(".ts-ill__swiper", {
    loop: true,
    slidesPerView: "auto",
    spaceBetween: 40,
    speed: 500,
    autoplay: reduce ? false : { delay: 3000, disableOnInteraction: false, waitForTransition: false },
    grabCursor: true,
    navigation: { nextEl: ".ts-ill__next" },
  });
})();
