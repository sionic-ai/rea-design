// Other staff card row — exactly the original othersSlider: Swiper loop, 600ms, 4s autoplay, 1·2·3·4 cards by width, prev·next·pause buttons and page count 01/08
(() => {
  if (!window.Swiper) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const count = document.querySelector(".js-more-count"), total = document.querySelectorAll(".js-more .swiper-slide").length;
  const pad = (n) => String(n).padStart(2, "0");
  const sw = new Swiper(".js-more", {
    slidesPerView: 1, loop: true, speed: 600, spaceBetween: 32, threshold: 10,
    autoplay: reduce ? false : { delay: 4000, disableOnInteraction: false },
    breakpoints: { 750: { slidesPerView: 2 }, 950: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } },
  });
  const sync = () => (count.textContent = `${pad(sw.realIndex + 1)}/${pad(total)}`);
  sync();
  sw.on("slideChange", sync);
  document.querySelector(".js-more-prev")?.addEventListener("click", () => sw.slidePrev());
  document.querySelector(".js-more-next")?.addEventListener("click", () => sw.slideNext());
  const stop = document.querySelector(".js-more-stop");
  let paused = false;
  stop?.addEventListener("click", () => { paused ? sw.autoplay.start() : sw.autoplay.stop(); paused = !paused; stop.classList.toggle("is-paused", paused); });
})();
