// Monthly cards — original swiper (auto width · 20px · free drag + snap · grab-hand cursor · horizontal wheel only)
(() => {
  const el = document.querySelector(".gb-months__swiper");
  if (!el || !window.Swiper) return;
  const sw = new Swiper(el, {
    slidesPerView: "auto", spaceBetween: 20,
    freeMode: { enabled: true, sticky: true },
    grabCursor: true, mousewheel: { forceToAxis: true },
  });
  document.querySelector("[data-gb-month-prev]")?.addEventListener("click", () => sw.slidePrev());
})();
