(() => {
  // With a Swiper fade the large panels crossfade in 1.4s, and inside the active panel a round window opens late — window 0 → 1, inner image 2 → 1 (same curve),
  // Phrases and text lines float up one after another. When the panel turns off, after the panel fade ends (speed) everything returns to the start position at once. CSS handles the look, Swiper handles panel selection.
  kfFx.register("circle-fade-slider", (el, { options, reduce }) => {
    const track = el.matches(".swiper") ? el : el.querySelector('[data-fx-part="track"]');
    if (!track || !window.Swiper || !track.querySelector(".swiper-slide")) return;
    const num = (k, d) => +(options[k] ?? d);
    const keys = [];
    const put = (k, v) => { el.style.setProperty(k, v); keys.push(k); };
    put("--fx-speed", `${num("speed", 1400) / 1000}s`);
    if (options.open != null) put("--fx-open", `${num("open", 1)}s`);
    if (options.wait != null) put("--fx-wait", `${num("wait", 1)}s`);
    if (options.text != null) put("--fx-text", `${num("text", 1.8)}s`);
    if (options.each != null) put("--fx-each", `${num("each", 0.2)}s`);
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const sw = new Swiper(track, {
      effect: "fade",
      fadeEffect: { crossFade: true },
      slidesPerView: 1,
      loop: true,
      speed: reduce ? 0 : num("speed", 1400),
      autoplay: reduce ? false : { delay: num("delay", 8000), disableOnInteraction: false, waitForTransition: false },
      followFinger: false,
      navigation: part("next") && part("prev") ? { nextEl: part("next"), prevEl: part("prev") } : false,
    });
    if (reduce) el.classList.add("is-fx-still");
    return () => { sw.destroy(true, true); keys.forEach((k) => el.style.removeProperty(k)); el.classList.remove("is-fx-still"); };
  });
})();
