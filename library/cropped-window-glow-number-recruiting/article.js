// Two interview sliders — Swiper 12.1.3 with the same settings as the original. When the width changes, they are built and destroyed like the original
//   Schedule: only at 768 and up, three columns · 72px gap · prev/next buttons / feature cards: only at 767 and below, card overlap (cards, no shadow) · auto height · prev/next buttons
(() => {
  if (!window.Swiper) return;
  const narrow = matchMedia("(max-width: 767px)");
  const schedule = document.querySelector(".ew-iv-schedule__swiper");
  const scheduleWrap = schedule?.querySelector(".ew-iv-schedule__wrapper");
  const features = document.querySelector(".ew-iv-features__swiper");
  const featuresList = features?.querySelector(".ew-iv-features__list");
  let scheduleSwiper, featuresSwiper;

  const setSchedule = () => {
    if (!schedule || !scheduleWrap) return;
    if (narrow.matches) {
      scheduleSwiper?.destroy(true, true);
      scheduleSwiper = undefined;
      schedule.classList.remove("swiper");
      scheduleWrap.classList.remove("swiper-wrapper");
      return;
    }
    schedule.classList.add("swiper");
    scheduleWrap.classList.add("swiper-wrapper");
    scheduleSwiper ||= new Swiper(schedule, {
      slidesPerView: 3,
      spaceBetween: 72,
      navigation: { prevEl: ".ew-iv-schedule__prev", nextEl: ".ew-iv-schedule__next" },
    });
  };
  const setFeatures = () => {
    if (!features || !featuresList) return;
    if (!narrow.matches) {
      featuresSwiper?.destroy(true, true);
      featuresSwiper = undefined;
      features.classList.remove("swiper");
      featuresList.classList.remove("swiper-wrapper");
      return;
    }
    features.classList.add("swiper");
    featuresList.classList.add("swiper-wrapper");
    featuresSwiper ||= new Swiper(features, {
      slidesPerView: 1,
      effect: "cards",
      autoHeight: true,
      cardsEffect: { slideShadow: false },
      navigation: { prevEl: ".ew-iv-features__prev", nextEl: ".ew-iv-features__next" },
    });
  };
  narrow.addEventListener("change", setSchedule);
  setSchedule();
  narrow.addEventListener("change", setFeatures);
  setFeatures();
})();
