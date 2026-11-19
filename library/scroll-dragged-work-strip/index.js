(() => {
  gsap.registerPlugin(ScrollTrigger);

  // Site-builder Slide effect: when visible, it stands up from 100px below and transparent over 1s outQuart, and once fully off screen it fades over 1s inQuart — it floats up again on re-entry
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      gsap.set(el, { opacity: 0, y: 100 });
      const show = () => gsap.fromTo(el, { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, ease: "power4.out", overwrite: true });
      const hide = () => gsap.to(el, { opacity: 0, duration: 1, ease: "power4.in", overwrite: true });
      ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onEnter: show, onEnterBack: show, onLeave: hide, onLeaveBack: hide });
    });
  });

  // Original Swiper settings as is (1.2 slides → 768 and up 2.5 centered → 1024 and up 4 slides)
  new Swiper(".oc-jswiper", {
    slidesPerView: 1.2,
    spaceBetween: 20,
    loop: true,
    loopAdditionalSlides: 4,
    breakpoints: {
      768: { slidesPerView: 2.5, spaceBetween: 15, centeredSlides: true },
      1024: { slidesPerView: 4, spaceBetween: 20 },
    },
  });
})();
