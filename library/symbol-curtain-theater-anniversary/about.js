// 40-year archive — the photo album is the same slick 1.8.1 as the original (centerMode · variable width · 6s autoplay · 1s linear slide), picking a year shows only that year’s table and scrolls to the top of the table
(() => {
  const arrow = '<svg viewBox="0 0 10 16" aria-hidden="true"><path d="M1 1l7 7-7 7"/></svg>';
  if (window.jQuery && jQuery.fn.slick) {
    jQuery(".kg-gallery__content").slick({
      autoplay: !window.kgReduce,
      autoplaySpeed: 6000,
      arrows: true,
      prevArrow: `<button class="kg-gallery__arrow -prev" type="button" aria-label="Previous photo">${arrow}</button>`,
      nextArrow: `<button class="kg-gallery__arrow -next" type="button" aria-label="Next photo">${arrow}</button>`,
      centerMode: true,
      dots: true,
      appendDots: jQuery(".kg-gallery__dots"),
      draggable: true,
      easing: "linear",
      infinite: true,
      pauseOnFocus: false,
      pauseOnHover: false,
      slidesToShow: 7,
      slidesToScroll: 1,
      speed: 1000,
      swipe: true,
      swipeToSlide: true,
      touchMove: true,
      variableWidth: true,
    });
  }
  const select = document.querySelector(".kg-detail__select select");
  const txt = document.querySelector(".kg-detail__select-txt");
  select?.addEventListener("change", () => {
    document.querySelectorAll(".kg-detail__table").forEach((t) => t.classList.toggle("is-active", t.dataset.year === select.value));
    txt.textContent = select.value + "Year Archive";
    const top = document.querySelector(".kg-detail").getBoundingClientRect().top + scrollY;
    gsap.to(window, { scrollTo: top, duration: 0.8, ease: "expo.inOut", overwrite: true });
  });
})();
