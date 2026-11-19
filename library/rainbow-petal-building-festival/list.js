// Project hero (list · street memory · post detail): Swiper fade (original: every 4 seconds 1s, no manual swiping, infinite) · the first photo settles into place from 1.2x·transparent in 2s power4.out
(() => {
  const mv = document.querySelector("[data-mv]");
  if (mv) new Swiper(mv, {
    allowTouchMove: false, slidesPerView: "auto", loop: true, speed: 1000, effect: "fade",
    autoplay: { delay: 4000, disableOnInteraction: false, waitForTransition: false },
  });
  const pics = document.querySelectorAll(".pj-mv__pic, [data-intro]");
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    if (pics.length) gsap.fromTo(pics, { scale: 1.2, autoAlpha: 0 }, { duration: 2, ease: "power4.out", scale: 1, autoAlpha: 1 });
  });
})();
