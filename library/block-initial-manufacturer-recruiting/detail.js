// Job detail — original workAnimation: the white card in the pinned section has a -120px parallax (scrub), other jobs Swiper (1.3 slides/20 → 3.15 slides/30 at 768+, .6s, phone progress bar).
(() => {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll(".c-fixedBg__inner").forEach((el) => {
      gsap.fromTo(el, { y: 0 }, { y: -120, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });
  });

  const wrap = document.querySelector(".c-pageNavigation__wrap");
  if (wrap && window.Swiper) {
    const sp = innerWidth < 768;
    new Swiper(wrap, {
      loop: false,
      speed: 600,
      slidesPerView: 1.3,
      spaceBetween: 20,
      navigation: { nextEl: ".c-pageNavigation__next", prevEl: ".c-pageNavigation__prev" },
      pagination: { el: ".c-pageNavigation__pagination", clickable: true, type: sp ? "progressbar" : "bullets" },
      breakpoints: { 768: { slidesPerView: 3.15, spaceBetween: 30 } },
    });
  }
})();
