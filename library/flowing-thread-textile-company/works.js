// Featured projects: center-emphasis loop strip — same Swiper 11.2.10 and same settings as the original (loop · centered · 4.4 slides with 10px gap above 981px · 2 below · arrows). The center 1.4x .7s is CSS.
// The archived HTML had 5 slides above 901px but the current original has 4.4 above 981px (checked 2026-10-31 by reading swiper.params from the original), so follow the current one
(() => {
  const box = document.querySelector(".tp");
  if (!box || !window.Swiper) return;
  // Five sheets are too few to repeat, so as in the original add one more set and loop through ten
  const track = box.querySelector(".tp__track");
  [...track.children].forEach((s) => track.append(s.cloneNode(true)));
  new Swiper(box, {
    loop: true,
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 2,
    navigation: { nextEl: box.querySelector(".tp__nav--next"), prevEl: box.querySelector(".tp__nav--prev") },
    breakpoints: { 981: { slidesPerView: 4.4, spaceBetween: 10 } },
  });
})();
