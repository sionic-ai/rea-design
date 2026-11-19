// First page: hero swiper (slide · 1.2s transition · 5s pause · infinite loop · drag · dynamic dots) and the progress bar below (pause + transition = 6.2s with no curve, restarting from the beginning each time the turn ends),
// Category row swiper (the reviews row is shared with the About page, so shared.js). The settings JSON of the original Allure section-slideshow as is
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SPEED = 1200, DELAY = 5000;

  const hero = document.querySelector(".mm-hero__slider");
  const fill = hero.querySelector(".mm-hero__fill");
  let bar = null;
  const restart = () => {
    if (reduce) return;
    bar?.cancel();
    bar = fill.animate([{ width: "0%" }, { width: "100%" }], { duration: DELAY + SPEED, easing: "linear", fill: "forwards" });
  };
  new Swiper(hero, {
    slidesPerView: 1,
    grabCursor: true,
    loop: true,
    speed: reduce ? 0 : SPEED,
    spaceBetween: 16,
    pagination: { el: hero.querySelector(".swiper-pagination"), clickable: true, dynamicBullets: true },
    autoplay: reduce ? false : { delay: DELAY, disableOnInteraction: false },
    on: { init: restart, slideChangeTransitionEnd: restart },
  });
  // Starts the transition effect (photo 1.25x · text 1 second late) from the frame after the current section marker is attached — the first section shows its own look right away
  requestAnimationFrame(() => requestAnimationFrame(() => hero.closest(".mm-hero").classList.add("is-ready")));

  const cats = document.querySelector(".mm-cats__slider");
  new Swiper(cats, {
    slidesPerView: 2.2,
    spaceBetween: 16,
    speed: 400,
    navigation: { prevEl: ".mm-cats__prev", nextEl: ".mm-cats__next", lockClass: "swiper-button-lock" },
    breakpoints: { 576: { slidesPerView: 3.2 }, 768: { slidesPerView: 4.2 }, 992: { slidesPerView: 5.2 }, 1200: { slidesPerView: 6 } },
  });
})();
