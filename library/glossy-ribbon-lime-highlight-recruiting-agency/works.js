// Work list: featured work slider — Swiper 8.4.7 same as the original (loop · centeredSlides · loopedSlides 8 · speed .6s · autoplay 5s · prev/next buttons), and,
// Each time a transition starts, change the number and refill the bar linearly from 0 over 5s.
(() => {
  const { reduced } = window.PC;
  const box = document.querySelector(".wk-feat__slider");
  const total = box.querySelectorAll(".swiper-slide").length;
  const cur = box.querySelector(".wk-feat__cur");
  const fill = box.querySelector(".wk-feat__bar i");
  box.querySelector(".wk-feat__tot").textContent = String(total).padStart(2, "0");
  const DELAY = 5000;
  const bar = () => {
    fill.style.transition = "none";
    fill.style.width = "0%";
    requestAnimationFrame(() => {
      fill.style.transition = reduced ? "none" : `width ${DELAY}ms linear`;
      fill.style.width = "100%";
    });
  };
  new Swiper(box, {
    loop: total > 1,
    centeredSlides: true,
    slidesPerView: 1,
    loopedSlides: 8,
    speed: 600,
    autoplay: reduced ? false : { delay: DELAY, disableOnInteraction: false },
    navigation: { nextEl: box.querySelector(".wk-feat__nav.is-next"), prevEl: box.querySelector(".wk-feat__nav.is-prev") },
    on: {
      init: bar,
      slideChangeTransitionStart() {
        cur.textContent = String(this.realIndex + 1).padStart(2, "0");
        bar();
      },
    },
  });
})();
