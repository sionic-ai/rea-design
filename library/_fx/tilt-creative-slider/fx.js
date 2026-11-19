(() => {
  // Tilts and overlaps photo sheets with the Swiper creative effect — deck (default) stacks the next sheet at the same spot at +tilt° and the previous at −tilt°, and the current sheet’s photo disappears before the flip
  // The next section underneath shows through. ‹peek› tilts the current section by tilt° and moves the side sections x% and ∓y% aside at .8x so they show on both sides (narrow screens: one spot ∓tilt°)
  kfFx.register("tilt-creative-slider", (el, { options, reduce }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    if (!track || !window.Swiper || !track.querySelector(".swiper-slide")) return;
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const num = (k, d) => +(options[k] ?? d);
    const peek = options.look === "peek";
    const tilt = num("tilt", peek ? 2 : 4);
    const pad = (n) => String(n).padStart(3, "0");
    const cur = part("cur"), total = part("total");
    const tell = (sw) => {
      if (total) total.textContent = pad(track.querySelectorAll(".swiper-slide:not(.swiper-slide-duplicate)").length);
      if (cur) cur.textContent = pad(sw.realIndex + 1);
      el.dispatchEvent(new CustomEvent("fx:change", { detail: { index: sw.realIndex } }));
    };
    const side = { limitProgress: 3, perspective: true, progressMultiplier: 1 };
    const x = num("x", 104), y = num("y", 16), scale = num("scale", 0.8);
    const sw = new Swiper(track, {
      effect: "creative",
      slidesPerView: 1,
      loop: true,
      loopAdditionalSlides: 1,
      speed: reduce ? 0 : num("speed", 800),
      autoplay: reduce ? false : { delay: num("delay", peek ? 4000 : 3200), disableOnInteraction: false },
      allowTouchMove: peek,
      creativeEffect: peek ? { ...side, next: { rotate: [0, 0, -tilt] }, prev: { rotate: [0, 0, tilt] } } : { next: { rotate: [0, 0, tilt] }, prev: { rotate: [0, 0, -tilt] } },
      breakpoints: peek ? { [num("wide", 768)]: { loopAdditionalSlides: 3, creativeEffect: { ...side, next: { translate: [`${x}%`, `${-y}%`, 0], rotate: [0, 0, -tilt], scale }, prev: { translate: [`${-x}%`, `${y}%`, 0], rotate: [0, 0, -tilt], scale } } } } : {},
      navigation: part("next") && part("prev") ? { nextEl: part("next"), prevEl: part("prev") } : false,
      on: { afterInit: tell, realIndexChange: tell },
    });
    el.style.setProperty("--fx-tilt", `${tilt}deg`);
    // Hero that starts advancing after the curtain lifts — waits until the caller sends fx:start, and the first-section photo disappears after --fx-first-at
    const wait = options.start === "event";
    const go = () => {
      sw.slides[sw.activeIndex]?.classList.add("is-fx-first");
      sw.autoplay?.start();
    };
    if (wait) sw.autoplay?.stop();
    if (wait) el.addEventListener("fx:start", go);
    return () => {
      el.removeEventListener("fx:start", go);
      el.style.removeProperty("--fx-tilt");
      sw.destroy(true, true);
    };
  });
})();
