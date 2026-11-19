// Original Swiper settings as is — category fade (random first slide) · featured 2–3 slides · screening/special (1024 and up only) · articles 3.5 slides
(() => {
  const hero = document.querySelector(".hy-hero");
  if (hero) {
    const n = hero.querySelectorAll(".swiper-slide").length;
    hySwiper(hero, { initialSlide: Math.floor(Math.random() * n), effect: "fade", fadeEffect: { crossFade: true }, on: { afterInit: (s) => s.el.classList.add("is-ready") } });
  }
  hySwiper(document.querySelector(".hy-pick__slider"), {
    navigation: { nextEl: ".pick-next", prevEl: ".pick-prev" },
    breakpoints: { 768: { slidesPerView: 2, centeredSlides: true }, 1024: { slidesPerView: 2, centeredSlides: false }, 1441: { slidesPerView: 3 } },
  });
  const wide = matchMedia("(min-width: 1024px)");
  document.querySelectorAll("[data-show]").forEach((el) => {
    const s = hySwiper(el, { enabled: wide.matches, navigation: { nextEl: el.querySelector(".is-next"), prevEl: el.querySelector(".is-prev") } });
    wide.addEventListener("change", (e) => (e.matches ? s?.enable() : s?.disable()));
  });
  hySwiper(document.querySelector(".hy-article__slider"), {
    slidesPerView: 1.2, centeredSlides: true,
    navigation: { nextEl: ".art-next", prevEl: ".art-prev" },
    breakpoints: { 768: { slidesPerView: 2, centeredSlides: true }, 1024: { slidesPerView: 3, centeredSlides: false }, 1360: { slidesPerView: 3.5, centeredSlides: false }, 1560: { slidesPerView: 4, centeredSlides: false } },
  });
})();
