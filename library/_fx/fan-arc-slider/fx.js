(() => {
  // Swiper creative fans the card row out — cards beside the center one step aside by one slot (100%) and sag downward (y%), with the rotation origin set far below the cards
  // Tilts ±rotate° each as if pinned around a wheel rim. Loops endlessly and rolls one slot at each set interval over speed. Below width wide it tilts more (±15°).
  kfFx.register("fan-arc-slider", (el, { options, reduce }) => {
    const track = el.matches(".swiper") ? el : el.querySelector('[data-fx-part="track"]');
    if (!track || !window.Swiper || !track.querySelector(".swiper-slide")) return;
    const num = (k, d) => +(options[k] ?? d);
    const fan = (rot, y, origin, limit) => ({ limitProgress: limit, prev: { translate: ["-100%", `${y}%`, 0], rotate: [0, 0, -rot], origin: `50% ${origin}px` }, next: { translate: ["100%", `${y}%`, 0], rotate: [0, 0, rot], origin: `50% ${origin}px` } });
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const sw = new Swiper(track, {
      effect: "creative",
      creativeEffect: fan(num("rotate-sp", 15), num("y-sp", 10), num("origin-sp", 300), num("limit-sp", 2)),
      breakpoints: { [num("wide", 768)]: { creativeEffect: fan(num("rotate", 8), num("y", 15), num("origin", 500), num("limit", 4)) } },
      slidesPerView: "auto",
      loop: true,
      speed: reduce ? 0 : num("speed", 1400),
      autoplay: reduce ? false : { delay: num("delay", 8000), disableOnInteraction: false, waitForTransition: false },
      centeredSlides: true,
      spaceBetween: num("gap", 100),
      followFinger: true,
      navigation: part("next") && part("prev") ? { nextEl: part("next"), prevEl: part("prev") } : false,
    });
    return () => sw.destroy(true, true);
  });
})();
