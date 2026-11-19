// Hero — exactly the original Swiper 11 settings: loop · fade (crossFade) · speed 2000 · autoplay 2000 · dot pagination
(() => {
  const el = document.querySelector(".sv-mv__swiper");
  if (!el || !window.Swiper) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  new Swiper(el, {
    loop: true, speed: reduce ? 0 : 2000, effect: "fade", fadeEffect: { crossFade: true },
    autoplay: reduce ? false : { delay: 2000 },
    pagination: { el: ".sv-mv__dots" },
  });
})();
