// Work detail — photo slide follows the original Swiper settings (centered · advances in 2s every 5 seconds · never pauses), the side table of contents lights up while that section passes under the header (wide screens only)
(() => {
  const el = document.querySelector(".g-dslider");
  if (el && window.Swiper) {
    new Swiper(el, {
      loop: true, loopAdditionalSlides: 1, slidesPerView: "auto", spaceBetween: 18, centeredSlides: true, speed: 2000,
      autoplay: { delay: 5000, disableOnInteraction: false, waitForTransition: false }, watchSlidesProgress: true,
      pagination: { el: ".g-dslider__nav .swiper-pagination", clickable: true },
      navigation: { nextEl: ".g-dslider__nav .swiper-button-next", prevEl: ".g-dslider__nav .swiper-button-prev" },
    });
  }
  const head = document.querySelector(".g-head");
  const items = document.querySelectorAll(".g-dindex__item");
  gsap.matchMedia().add("(min-width: 1024px)", () => {
    document.querySelectorAll('section[id^="section-"]').forEach((sec, i) => {
      if (!items[i]) return;
      const h = head.clientHeight, at = h + 30;
      ScrollTrigger.create({ trigger: sec, start: `top-=${h} ${at}`, end: `bottom-=${h} ${at}`, toggleClass: { targets: items[i], className: "is-show" }, invalidateOnRefresh: true });
    });
  });
})();
