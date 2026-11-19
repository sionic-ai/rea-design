// Careers page: a five-photo slider per style — original Swiper 8.4.7 values as-is (loop · parallax 100% · 1.2s transition · autoplay 3s while on screen ·
// Five thumbnails with a gap of 6). On phone, move the thumbnails below the large photo
(() => {
  const phone = matchMedia("(max-width: 768px)");
  document.querySelectorAll(".design__item").forEach((item) => {
    const slider = item.querySelector(".swiper-design");
    const box = item.querySelector(".swiper-design-thumbs");
    const content = item.querySelector(".design__content");
    const thumbs = new Swiper(box, { slidesPerView: 5, spaceBetween: 6 });
    const main = new Swiper(slider, {
      loop: true,
      parallax: true,
      allowTouchMove: false,
      speed: 1200,
      autoplay: { delay: 3000, disableOnInteraction: false },
      thumbs: { swiper: thumbs },
    });
    if (eu.reduce) main.autoplay.stop();
    // Original on every scroll: autoplay.start if on screen, stop if off
    else addEventListener("scroll", () => {
      const r = slider.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom >= 0) {
        main.params.autoplay.delay = 3000;
        main.autoplay.start();
      } else main.autoplay.stop();
    }, { passive: true });

    const place = () => (phone.matches ? slider.after(box) : content.append(box));
    phone.addEventListener("change", place);
    place();
  });
})();
