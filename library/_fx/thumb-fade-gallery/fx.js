// Ties the big photo ring (Swiper fade) to the small photo row below — when the big photo moves on, that small photo’s white cover lifts, and pressing a small photo goes to that slide.
// The original turns auto-advance on when the gallery comes within 100px of the screen bottom, and off again when it leaves (checked on every scroll)
(() => {
  kfFx.register("thumb-fade-gallery", (el, { options, reduce, scroller }) => {
    const main = el.querySelector('[data-fx-part="main"]'), thumbs = el.querySelector('[data-fx-part="thumbs"]');
    if (!main || !window.Swiper || main.querySelectorAll(".swiper-slide").length < 2) return;
    const per = +options.per || 4, gap = +(options.gap ?? 10), delay = +(options.delay ?? 4000), speed = +(options.speed ?? 3000), margin = +(options.margin ?? 100);
    const th = thumbs && thumbs.querySelector(".swiper-slide") ? new Swiper(thumbs, { slidesPerView: per, spaceBetween: gap, freeMode: true, watchSlidesProgress: true }) : null;
    const sw = new Swiper(main, { loop: true, effect: "fade", autoplay: { delay, disableOnInteraction: false }, speed, ...(th && { thumbs: { swiper: th } }) });
    sw.autoplay.stop();
    if (reduce) return () => { sw.destroy(true, true); th && th.destroy(true, true); };
    const src = scroller || window;
    const check = () => {
      const r = el.getBoundingClientRect(), vh = scroller ? scroller.clientHeight : innerHeight, top0 = scroller ? scroller.getBoundingClientRect().top : 0;
      if (r.top - top0 < vh - margin) sw.autoplay.start(); else sw.autoplay.stop();
    };
    src.addEventListener("scroll", check, { passive: true });
    check();
    return () => { src.removeEventListener("scroll", check); sw.destroy(true, true); th && th.destroy(true, true); };
  });
})();
