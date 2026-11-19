// Achievement detail: large photo swiper and a thumbnail row (5.4 slides · gap 5) — as in the original, when the large photo changes, the thumbnail row moves to that spot in 300ms.
(() => {
  if (!window.Swiper) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const thumbs = new Swiper(".tf-thumbswiper", { slidesPerView: 5.4, spaceBetween: 5, watchSlidesProgress: true });
  new Swiper(".tf-imgswiper", {
    slidesPerView: 1,
    speed: reduce ? 0 : 300,
    navigation: { nextEl: ".tf-single__next", prevEl: ".tf-single__prev" },
    thumbs: { swiper: thumbs },
    on: { slideChange: (s) => thumbs.slideTo(s.realIndex, reduce ? 0 : 300) },
  });
})();
