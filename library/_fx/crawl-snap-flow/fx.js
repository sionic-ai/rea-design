// The photo strip advances one slot every 7s endlessly, but within a slot it creeps only 4.6% for 46% of the time, then flicks the rest across around the middle .5s and creeps again.
// The Curve overrides the transition Swiper puts on the strip with CSS linear() — it is not a GSAP Curve, because it spans one slot of Swiper autoplay (delay 0)
(() => {
  kfFx.register("crawl-snap-flow", (el, { options, reduce }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    if (!track || !window.Swiper || !track.querySelector(".swiper-slide")) return;
    const tick = el.querySelector('[data-fx-part="tick"]');
    const count = track.querySelectorAll(".swiper-slide").length;
    const speed = +options.speed || 7000;
    const gapWide = +(options.gap ?? 16), gapNarrow = +(options["gap-sp"] ?? 8);
    // Original scales the gaps between columns with window width — 393 width basis at 767px and below, 1440 width basis above
    const gap = () => (innerWidth <= 767 ? (gapNarrow / 393) * innerWidth : (gapWide / 1440) * innerWidth);
    // The tick moves within 92% of the bar by the current cell’s turn (the movement is a css left transition)
    const mark = (sw) => { if (tick) tick.style.left = `${count > 1 ? (sw.realIndex / (count - 1)) * 92 : 0}%`; };
    const swiper = new Swiper(track, {
      slidesPerView: "auto",
      centeredSlides: options.center !== "0",
      loop: true,
      speed,
      spaceBetween: gap(),
      allowTouchMove: options.touch !== "0",
      autoplay: reduce ? false : { delay: 0, disableOnInteraction: false },
      on: { init: mark, slideChange: mark },
    });
    const resize = () => { swiper.params.spaceBetween = gap(); swiper.update(); };
    addEventListener("resize", resize);
    return () => {
      removeEventListener("resize", resize);
      swiper.destroy(true, true);
      if (tick) tick.style.left = "";
    };
  });
})();
