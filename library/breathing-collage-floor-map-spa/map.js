// Travel Map section — once a cell’s top edge reaches 80% of the screen it is set to visible once, plus the phone’s landmark drag row (inertia .1)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);
  const els = document.querySelectorAll("[data-mp-reveal]");
  if (reduce) els.forEach((el) => el.classList.add("is-shown"));
  else gsap.matchMedia().add("all", () => {
    els.forEach((el) => ScrollTrigger.create({ trigger: el, start: "top 80%", once: true, onEnter: () => el.classList.add("is-shown") }));
  });
  const slider = document.querySelector(".mp-route__slider");
  new Swiper(slider, {
    slidesPerView: "auto",
    freeMode: { enabled: true, momentum: true, momentumRatio: 0.1, momentumVelocityRatio: 0.1, sticky: false },
    spaceBetween: 13,
    scrollbar: { el: slider.querySelector(".mp-route__scrollbar"), draggable: true },
  });
})();
