// Rows of product and photo cells stick out past the panel edge (right or left) and loop endlessly, advancing one cell at speed every delay — Swiper loop.
// On wide screens the cell width is set by css (--fx-slide) with slidesPerView auto, so the next cell peeks at the panel edge, narrow screens show 1.13 cells, mid width 3 cells.
// Even when swiped by hand autoplay doesn’t stop (disableOnInteraction false), and the next timer runs even during a transition (waitForTransition false)
(() => {
  kfFx.register("peek-loop-carousel", (el, { options, reduce }) => {
    const track = el.matches(".swiper, .swiper-container") ? el : el.querySelector('[data-fx-part="track"]');
    if (!track || !window.Swiper || !track.querySelector(".swiper-slide")) return;
    const num = (k, d) => (options[k] != null && options[k] !== "" ? +options[k] : d);
    const per = (k, d) => (options[k] == null ? d : options[k] === "auto" ? "auto" : +options[k] || d);
    const wide = +options.wide || 840, mid = +options.mid || 640;
    const prev = el.querySelector('[data-fx-part="prev"]'), next = el.querySelector('[data-fx-part="next"]');
    const swiper = new Swiper(track, {
      loop: options.loop !== "0",
      speed: num("speed", 300),
      autoplay: reduce || options.auto === "off" ? false : { delay: num("delay", 3000), disableOnInteraction: false, waitForTransition: false },
      slidesPerView: per("per-narrow", 1.13),
      spaceBetween: num("gap-narrow", 20),
      breakpoints: {
        [mid]: { slidesPerView: per("per-mid", 3) },
        [wide]: { slidesPerView: per("per", "auto"), spaceBetween: num("gap", 0) },
      },
      ...((prev || next) && { navigation: { prevEl: prev, nextEl: next } }),
    });
    el.classList.add("is-fx-ready");
    return () => {
      swiper.destroy(true, true);
      el.classList.remove("is-fx-ready");
    };
  });
})();
