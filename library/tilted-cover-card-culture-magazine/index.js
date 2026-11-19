// Pickup Swiper (original #pickup-swiper values as is), and the original updateBadgePosition that places the badge at the right end of the center slide.
(() => {
  const el = document.querySelector(".bm-pickup__swiper"), sec = document.querySelector(".bm-pickup");
  if (!el || typeof Swiper === "undefined") return;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  new Swiper(el, {
    slidesPerView: 2, spaceBetween: 25, centeredSlides: true, loop: true,
    autoplay: still ? false : { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true },
    breakpoints: { 768: { slidesPerView: 3.5, spaceBetween: 20 }, 1280: { slidesPerView: 6, spaceBetween: 20 } },
  });
  const badge = () => {
    const s = innerWidth;
    let t = 2, gap = 25;
    if (s >= 1280) { t = 6; gap = 20; } else if (s >= 768) { t = 3.5; gap = 20; }
    const w = (s - gap * (Math.ceil(t) - 1)) / t;
    sec.style.setProperty("--badge-x", `${s / 2 + w / 2}px`);
  };
  badge();
  addEventListener("resize", badge);
})();
