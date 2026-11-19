// Profile photo slider — the same Swiper 5.3.6 settings as the original. With reduced motion only autoplay is turned off (dots and dragging stay).
// The original writes crossFade outside fadeEffect so Swiper doesn’t read it — this follows that look, where the old photo stays put and only the new photo floats up over it.
(() => {
  const el = document.querySelector(".pr__slides");
  if (!el || typeof Swiper === "undefined") return;
  new Swiper(el, {
    speed: 800,
    loop: true,
    effect: "fade",
    fadeEffect: { crossFade: false },
    autoplay: SK.reduced ? false : { delay: 4000 },
    pagination: { el: ".pr__dots", type: "bullets", clickable: true },
  });
})();
