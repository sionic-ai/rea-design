// Restaurant: same Swiper 11 as the original — photo gallery (large photo fade · .5s · 4s autoplay · three/five thumbnails) and course card row (1.2 cards · centered · endless · drag · dot click)
(() => {
  if (!window.Swiper) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".js-thumb-gallery").forEach((el) => {
    const thumb = new Swiper(el.querySelector(".js-thumb-gallery_thumb"), { slidesPerView: 3, spaceBetween: 20, breakpoints: { 768: { slidesPerView: 5 } } });
    new Swiper(el.querySelector(".js-thumb-gallery_slider"), { loop: true, effect: "fade", centeredSlides: true, speed: reduce ? 0 : 500, autoplay: reduce ? false : { delay: 4000, disableOnInteraction: false }, thumbs: { swiper: thumb } });
  });
  const course = document.querySelector(".js-course_slider");
  if (course) new Swiper(course, { speed: reduce ? 0 : 500, grabCursor: true, spaceBetween: 20, slidesPerView: 1.2, centeredSlides: true, loop: true, setWrapperSize: true, pagination: { el: course.querySelector(".swiper-pagination"), clickable: true }, breakpoints: { 768: { spaceBetween: 40 } } });
})();
