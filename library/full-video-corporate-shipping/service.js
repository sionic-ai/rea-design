// Service — centered card panel (same Swiper settings as the original: loop, auto, 24px, .9s), the photo inside each card shifts 5% by its slot and scales 1.16x
(() => {
  const OL = (window.OL = window.OL || { pages: {} });
  OL.page("service", (root) => {
    const el = root.querySelector(".ol-ob__slider");
    if (!el) return;
    const bar = root.querySelector(".ol-ob__bar");
    const progress = (sw) => {
      const { translate: tr, width: w, slides } = sw;
      const cw = el.clientWidth;
      if (!cw) return;
      const o = cw - w, step = slides.length > 1 ? slides[1].swiperSlideOffset - slides[0].swiperSlideOffset : 0;
      if (!step) return;
      slides.forEach((s) => { const c = o + s.swiperSlideOffset + tr + s.swiperSlideSize / 2; s.style.setProperty("--sp", ((c - cw / 2) / step).toFixed(4)); });
      if (bar) bar.style.setProperty("--p", ((sw.realIndex + 1) / sw.slides.length).toFixed(4));
    };
    const sw = new Swiper(el, {
      loop: true, grabCursor: true, slidesPerView: "auto", slidesPerGroup: 1, loopAdditionalSlides: 1, watchSlidesProgress: true,
      centeredSlides: true, touchEventsTarget: "container", spaceBetween: 24, speed: 900, threshold: 25,
      breakpoints: { 0: { spaceBetween: 16 }, 768: { spaceBetween: 20 }, 1024: { spaceBetween: 24 } },
      on: {
        setTranslate: (s) => progress(s),
        setTransition: (s, t) => el.style.setProperty("--pdur", `${t}ms`),
        realIndexChange: (s) => progress(s),
      },
    });
    progress(sw);
    return () => sw.destroy(true, true);
  });
})();
