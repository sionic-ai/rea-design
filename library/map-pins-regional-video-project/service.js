// App intro — only on phones (768px and below), the two-row cards are swiped with Swiper (swiper 7 like the original, slidesPerView 1.5 · centered). When wider, it is destroyed and laid out in three columns
(() => {
  if (!window.Swiper) return;
  const opts = (el) => ({ slidesPerView: 1.5, centeredSlides: true, initialSlide: 0,
    pagination: { el: el.querySelector(".swiper-pagination") },
    navigation: { nextEl: el.querySelector(".swiper-button-next"), prevEl: el.querySelector(".swiper-button-prev") } });
  const boxes = [...document.querySelectorAll(".mk-swiper")];
  let made = [];
  const sync = () => {
    if (innerWidth <= 768) { if (!made.length) made = boxes.map((el) => new Swiper(el, opts(el))); }
    else if (made.length) { made.forEach((s) => s.destroy(true, true)); made = []; }
  };
  addEventListener("resize", sync);
  sync();
})();
