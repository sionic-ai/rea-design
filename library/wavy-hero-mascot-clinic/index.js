// Hero slider — built with the same Swiper as the original (8 panels): infinite · 3s transition · 6s auto · no hand drag · page number press.
// The photo’s blur · shift · 1.2x scale is applied by the 3s transition in index.css on the active/prev/next classes that Swiper attaches.
// Turned on after load, as in the original. The auto-advance 6s tempo counts from when the document is fully received
(() => {
  const el = document.querySelector(".me-hero__slide");
  if (!el || typeof Swiper === "undefined") return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const start = () => new Swiper(el, {
    loop: true,
    loopAdditionalSlides: 1,
    speed: reduce ? 0 : 3000,
    autoplay: reduce ? false : { delay: 6000, disableOnInteraction: false, waitForTransition: false },
    followFinger: false,
    observeParents: true,
    allowTouchMove: false,
    slidesPerView: 1,
    centeredSlides: true,
    pagination: { el: ".me-hero__pager", clickable: true },
  });
  if (document.readyState === "complete") start(); else addEventListener("load", start, { once: true });
})();
