// First page — the original, after window load, hooks the sign·copy (.st) at 1.5s, fruit branch at 1.8s, and the hero Swiper at 2s.
// The moment the white veil lifts (ac:ready = Takes load+1.5s) and applies it at the same interval.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sign = document.querySelector(".ac-fv__sign"), illust = document.querySelector(".ac-fv__illust"), copy = document.querySelector(".ac-fv__copy");
  document.addEventListener("ac:ready", () => {
    sign?.classList.add("is-in");
    copy?.setAttribute("data-fx", "band-reveal");
    setTimeout(() => illust?.classList.add("is-in"), 300);
    setTimeout(() => {
      // Original fv: loop · fade crossFade · autoplay 2000 · speed 2000 · cannot be swiped by hand
      new Swiper(".ac-fv__slide .swiper-container", { loop: true, effect: "fade", fadeEffect: { crossFade: true }, autoplay: reduce ? false : { delay: 2000, disableOnInteraction: false }, speed: 2000, allowTouchMove: false });
    }, 500);
  }, { once: true });

  // Team members — slidesPerView auto · speed 1000 · arrows
  new Swiper(".ac-member__list .swiper-container", { slidesPerView: "auto", speed: 1000, navigation: { nextEl: ".ac-member__next", prevEl: ".ac-member__prev" } });
  // Reading list — slidesPerView auto · speed 1000 · arrows · clickable dots
  new Swiper(".ac-article__list .swiper-container", { slidesPerView: "auto", speed: 1000, navigation: { nextEl: ".ac-article__next", prevEl: ".ac-article__prev" }, pagination: { el: ".ac-article__dots", clickable: true } });
})();
