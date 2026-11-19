// Careers — three header photos as a Swiper fade crossfade (overlapping change over 5s · every 8s · endless). The first plate sets up after .1s, the following ones .22s later each, and
// Auto-advance starts 0, 1 and 2s late so the three change out of step (original recruitCarousel). Once upright, the panel brightens over 2.5s and the photo settles from 1.1x in 3s.
(() => {
  const NS = (window.NS = window.NS || { views: {} });
  let made = [], timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  NS.views.recruit = {
    init(c) {
      if (!window.Swiper) return;
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      let build = 100, play = 0;
      c.querySelectorAll(".ns-rc").forEach((el) => {
        const start = play;
        later(() => {
          const sw = new Swiper(el, {
            allowTouchMove: false, loop: true, speed: reduce ? 0 : 5000, resizeObserver: false,
            autoplay: { delay: 8000, disableOnInteraction: false, waitForTransition: false },
            effect: "fade", fadeEffect: { crossFade: true },
          });
          sw.autoplay.stop();
          if (!reduce) later(() => sw.autoplay.start(), start);
          made.push(sw);
        }, build);
        play += 1000;
        build += 220;
      });
    },
    destroy() {
      timers.forEach(clearTimeout);
      made.forEach((s) => { s.autoplay?.stop(); s.destroy(true, true); });
      made = []; timers = [];
    },
  };
})();
