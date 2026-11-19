// First page: the concept background is covered by a white curtain as it goes down, and the shop photo row is dragged along with the same Swiper 11.1.1 as the original (inertial freeMode).
// Original values: curtain autoAlpha 0→1 scrub, concept "top bottom"→"bottom bottom" (Phone is "top bottom+200") /
// Swiper slidesPerView auto · speed 1200 · freeMode momentum (ratio 1) · grabCursor · draggable scrollbar — enabled only with 3+ slides (2+ on phone)
KS.page("home", (box) => {
  const { reduced } = window.KS;
  const tweens = [];
  const concept = box.querySelector(".js-concept");
  const filters = box.querySelectorAll(".js-concept-filter");
  if (concept && filters.length && !reduced) {
    const end = innerWidth <= 768 ? "top bottom+200" : "bottom bottom";
    tweens.push(gsap.from(filters, { autoAlpha: 0, ease: "none", scrollTrigger: { trigger: concept, start: "top bottom", endTrigger: concept, end, scrub: true, invalidateOnRefresh: true } }));
  }

  const sp = innerWidth <= 768;
  const swipers = [...box.querySelectorAll("[data-shop-swiper]")].map((el, i) => {
    const n = el.querySelectorAll(".swiper-slide").length;
    let bar = el.querySelector(".swiper-scrollbar");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = `swiper-scrollbar swiper-scrollbar-${i}`;
      el.append(bar);
    }
    if (!((n > 2 && !sp) || (n > 1 && sp))) return null;
    return new Swiper(el, {
      slidesPerView: "auto",
      slidesPerGroup: 1,
      speed: 1200,
      initialSlide: 0,
      centeredSlides: false,
      loop: false,
      grabCursor: true,
      watchSlidesProgress: false,
      preventClicks: true,
      preventClicksPropagation: true,
      freeMode: { enabled: true, momentum: true, momentumRatio: 1, momentumVelocityRatio: 1, sticky: false },
      scrollbar: { el: bar, draggable: true },
    });
  });
  return () => {
    tweens.forEach((t) => { t.scrollTrigger && t.scrollTrigger.kill(); t.revert(); });
    swipers.forEach((s) => s && s.destroy(true, true));
  };
});
