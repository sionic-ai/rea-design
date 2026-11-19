// Sub page (one shop) — header photo and title entrance, pinned concept panel, photo parallax, Swiper photo strip
KC.page("service", ({ main, second, later }) => {
  const { $, still } = KC;
  // Original init — the first-opened page runs immediately, when arriving via swup the title and list switch on after .5s and the photo shrinks to 1 over 1.2s
  const enter = () => {
    $(".kc-top__title", main).classList.add("is-view");
    $(".kc-top__list", main).classList.add("is-view");
    gsap.to($(".kc-top__img .wf-img", main), { scale: 1, duration: still ? 0 : 1.2, ease: "power3.out" });
  };
  if (second) later(enter, 500);
  else enter();

  // The original holds the concept panel for .5s only above 900px, until all three photos have passed
  const mm = gsap.matchMedia();
  mm.add("(min-width: 900px)", () => {
    if (still) return;
    const concept = $(".kc-concept", main);
    later(() => ScrollTrigger.create({ trigger: concept, start: "top top", endTrigger: $(".kc-imgs", main), end: "bottom bottom", pin: concept, pinSpacing: false }), 500);
  });

  let swiper = null;
  later(() => {
    KC.parallax(main);
    swiper = new Swiper($(".kc-slider .swiper", main), { loop: true, pagination: { el: $(".kc-slider .swiper-pagination", main), clickable: true } });
  }, 500);

  return () => {
    mm.revert();
    swiper?.destroy(true, true);
  };
});
