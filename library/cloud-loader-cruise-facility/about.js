// About — values exactly as the original main.js About·Swiper module: header photo pin (margin · corner scrub), spec numbers 2.5s circ.out, feature card Swiper 1s
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const pad = (n) => ("00" + n).slice(-2);
  const slides = document.querySelectorAll(".about-features__slider .swiper-slide").length;
  new Swiper(".about-features__slider .swiper", {
    slidesPerView: "auto",
    speed: reduce ? 0 : 1000,
    pagination: { el: ".swiper-pagination-main", clickable: true },
    navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
    on: {
      init: () => { document.querySelector(".js-slide-length").textContent = pad(slides); },
      transitionStart: (sw) => { document.querySelector(".js-active-index").textContent = pad(sw.activeIndex + 1); },
    },
  });

  const spec = document.querySelector("[data-about-spec-trigger]");
  addEventListener("load", () => {
    if (reduce) {
      spec?.querySelectorAll("[data-about-spec-target]").forEach((el) => (el.textContent = el.dataset.to));
      return;
    }
    const wrap = document.querySelector("[data-about-brand]"), fig = document.querySelector("[data-about-brand-figure]");
    gsap.to(wrap.querySelector(".about-mv__inner"), { paddingLeft: "0px", paddingRight: "0px", scrollTrigger: { trigger: wrap, start: "top top", endTrigger: ".about-intro", end: "bottom", scrub: true, pin: true, pinSpacing: false } });
    gsap.to(fig, { borderRadius: "0", scrollTrigger: { trigger: fig, start: "top top", end: "bottom", scrub: true } });
    spec?.querySelectorAll("[data-about-spec-target]").forEach((el) => {
      const n = { count: +el.dataset.from };
      gsap.to(n, { count: +el.dataset.to, duration: 2.5, ease: "circ.out", scrollTrigger: { trigger: spec, start: "top center" }, onUpdate: () => { el.textContent = Math.floor(n.count); } });
    });
  });
})();
