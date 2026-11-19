// A photo strip where only the center slide is full size and the side slides are smaller at .75× advances one slot every 4 seconds endlessly (Swiper loop · center aligned).
// Clicking a neighboring section brings it to center. The size change is not Swiper but a CSS transition (.3s ease) on each section, so it moves together with the slide (.3s).
(() => {
  kfFx.register("center-scale-carousel", (el, { options, reduce }) => {
    const track = el.matches(".swiper, .swiper-container") ? el : el.querySelector('[data-fx-part="track"]');
    if (!track || !window.Swiper || !track.querySelector(".swiper-slide")) return;
    const per = +options.per || 2.75;
    const perSp = +options["per-sp"] || 1.5;
    const wide = +options.wide || 768;
    const delay = +options.delay || 4000;
    const speed = +(options.speed ?? 300);
    const gap = +(options.gap ?? 0);
    if (options.scale != null) el.style.setProperty("--fx-scale", +options.scale);
    const swiper = new Swiper(track, {
      loop: options.loop !== "0",
      speed,
      autoplay: reduce ? false : { delay },
      slidesPerView: perSp,
      spaceBetween: gap,
      centeredSlides: true,
      slideToClickedSlide: true,
      breakpoints: { [wide]: { slidesPerView: per } },
    });
    return () => {
      swiper.destroy(true, true);
      el.style.removeProperty("--fx-scale");
    };
  });
})();
