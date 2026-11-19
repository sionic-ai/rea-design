// Hero background — the same Swiper 8 as the original Product background slideshow: fade · speed 0 (hard cut, no transition) · 2.2 seconds · loop.
// A background with text standing over photos, so no manual swiping. With reduced motion it stops on the first slide.
(() => {
  const el = document.querySelector(".wc-hero__slides");
  if (!el || typeof Swiper === "undefined") return;
  const mm = gsap.matchMedia();
  mm.add({ moving: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const sw = new Swiper(el, {
      effect: "fade",
      fadeEffect: { crossFade: false },
      speed: 0,
      loop: true,
      slidesPerView: 1,
      allowTouchMove: false,
      autoplay: ctx.conditions.moving ? { delay: 2200, disableOnInteraction: false, stopOnLastSlide: false } : false,
    });
    return () => sw.destroy(true, true);
  });
})();
