// Sub page — the About section’s photo plate is Swiper 8.4.5 fade crossFade 1500ms·4s autoplay like the original .sliderPhoto, with a play/pause button.
window.jpInit = ({ reduce }) => {
  const el = document.querySelector(".jp-sliderPhoto");
  if (!el) return;
  const sw = new Swiper(el, {
    loop: true,
    speed: reduce ? 0 : 1500,
    slidesPerView: 1,
    spaceBetween: 0,
    centeredSlides: true,
    autoplay: reduce ? false : { delay: 4000, disableOnInteraction: false },
    pagination: { el: ".jp-mission__photo .jp-swDots", type: "bullets", clickable: true },
    effect: "fade",
    fadeEffect: { crossFade: true },
  });
  window.jpSwipers.push(sw);
  $(".jp-sliderPhoto .jp-swPlay").on("click", function () {
    if ($(this).hasClass("is-stop")) sw.autoplay.start();
    else sw.autoplay.stop();
    $(this).toggleClass("is-stop");
  });
  if (reduce) $(".jp-sliderPhoto .jp-swPlay").addClass("is-stop");
};
