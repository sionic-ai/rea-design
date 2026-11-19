(() => {
  // Original values: 5s hold · 1s crossfade · bar drops out = Slide ÷ 1.5 · next slide’s text waits .5s before moving to its standby spot
  kfFx.register("fade-bar-slides", (el, { options, reduce }) => {
    if (typeof Swiper === "undefined") return;
    const box = el.matches(".swiper, .swiper-container") ? el : el.querySelector('[data-fx-part="track"]') || el.querySelector(".swiper, .swiper-container");
    if (!box || box.querySelectorAll(".swiper-slide").length < 2) return;
    const delay = +(options.delay ?? 5000) || 5000, speed = +(options.speed ?? 1000), lag = +(options.lag ?? 500);
    const fill = el.querySelector('[data-fx-part="fill"]'), count = el.querySelector('[data-fx-part="count"]');
    let barOn = !!fill && !reduce;
    const timers = new Set();
    const play = (anim) => { if (!barOn) return; fill.style.animation = "none"; fill.offsetHeight; fill.style.animation = anim; };
    const mark = (s) => {
      s.slides[s.previousIndex]?.classList.add("is-fx-prev");
      const next = s.slides[s.activeIndex === s.slides.length - 1 ? 0 : s.activeIndex + 1];
      if (next && next !== s.slides[s.activeIndex]) {
        const t = setTimeout(() => { timers.delete(t); next.classList.add("is-fx-next"); }, lag);
        timers.add(t);
      }
    };
    const sw = new Swiper(box, {
      speed: reduce ? 0 : speed,
      autoplay: reduce ? false : { delay, waitForTransition: true, disableOnInteraction: true },
      effect: "fade",
      fadeEffect: { crossFade: true },
      allowTouchMove: false,
      on: {
        init(s) { play(`fxFadeBarFill ${delay}ms linear 0s normal both`); mark(s); },
        slideChangeTransitionStart(s) { play(`fxFadeBarOut ${s.params.speed / 1.5}ms ease-in-out 0s both`); },
        slideChange(s) {
          if (count) count.textContent = s.realIndex + 1;
          s.slides.forEach((x) => x.classList.remove("is-fx-prev", "is-fx-next"));
        },
        slideChangeTransitionEnd(s) { play(`fxFadeBarFill ${delay}ms linear 0s normal both`); mark(s); },
        autoplayStop() { if (fill) fill.style.animation = "none"; barOn = false; },
      },
    });
    return () => {
      timers.forEach(clearTimeout);
      sw.destroy(true, true);
      box.querySelectorAll(".is-fx-prev, .is-fx-next").forEach((x) => x.classList.remove("is-fx-prev", "is-fx-next"));
      if (fill) fill.style.animation = "";
    };
  });
})();
