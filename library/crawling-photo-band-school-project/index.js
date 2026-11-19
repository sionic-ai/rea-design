// Project film — straight from the original Swiper: centered · cell width auto · wheel accepted on the horizontal axis only (.3s advance). Not a loop.
// The original passes autoplay: true but loads only the Mousewheel module, so it never advances by itself — the bundled Swiper has everything loaded, so turn it off
(() => {
  const el = document.querySelector(".ca-films__swiper");
  if (!el || !window.Swiper) return;
  const gap = () => (innerWidth <= 767 ? (8 / 393) * innerWidth : (16 / 1440) * innerWidth);
  const swiper = new Swiper(el, {
    slidesPerView: "auto",
    centeredSlides: true,
    spaceBetween: gap(),
    allowTouchMove: true,
    mousewheel: { invert: false, forceToAxis: true, sensitivity: 5 },
  });
  addEventListener("resize", () => { swiper.params.spaceBetween = gap(); swiper.update(); });
})();
