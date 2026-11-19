(() => {
  // Original common.js: pins the Hero height to the window height (instead of 100vh because of the phone address bar) — recomputed when the window resizes
  const mv = document.querySelector(".sh-mv");
  const fit = () => mv && (mv.style.height = `${innerHeight}px`);
  fit();
  addEventListener("resize", fit);

  // Original Swiper 11: two slides visible, one step every 4 seconds, turning in .8s. On phones it flows vertically and can’t be swiped, from 769px it is horizontal and draggable
  if (!window.Swiper) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const swiper = new Swiper(".sh-mv__swiper", {
    loop: true,
    speed: 800,
    slidesPerView: 2,
    slidesPerGroup: 1,
    spaceBetween: 0,
    allowTouchMove: false,
    touchStartPreventDefault: false,
    direction: "vertical",
    autoplay: reduce ? false : { delay: 4000, disableOnInteraction: false, reverseDirection: false },
    breakpoints: {
      769: { direction: "horizontal", slidesPerView: 2, slidesPerGroup: 1, spaceBetween: 0, allowTouchMove: true, touchStartPreventDefault: true, simulateTouch: true },
    },
    on: { init(s) { s.update(); }, resize(s) { s.update(); } },
  });
  addEventListener("load", () => swiper.update());
})();
