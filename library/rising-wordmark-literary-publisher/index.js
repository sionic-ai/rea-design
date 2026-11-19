// Home — cover slider (swiper 12.2.0 fade: .6s overlap, every 5s, endless, stops on press)
(() => {
  if (!window.Swiper) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  new Swiper(".li-hero__swiper", {
    slidesPerView: 1,
    effect: "fade",
    fadeEffect: { crossFade: true },
    speed: reduce ? 0 : 600,
    loop: true,
    autoplay: reduce ? false : { delay: 5000, disableOnInteraction: true },
    pagination: { el: ".li-hero__dots", clickable: true },
    a11y: { slideRole: "listitem" },
  });
})();
