/* Reading list — the original topics page inline script as is: featured posts Swiper (column width in css, 22px gap · 52px above 743px, stops at the end, two arrows).
   In the original, picking a category goes to that category’s address — here it stays on the same list. */
(() => {
  new Swiper(".js-pick", {
    slidesPerView: "auto",
    spaceBetween: 22,
    breakpoints: { 743: { spaceBetween: 52 } },
    loop: false,
    navigation: { nextEl: ".tt-pick .swiper-button-next", prevEl: ".tt-pick .swiper-button-prev" },
  });
})();
