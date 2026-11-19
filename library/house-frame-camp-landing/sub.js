// Shared sub-sections: FAQ open/close (height 0↔auto .3s), and the first-time visitor flow slider.
// Original numbers: details open and close with gsap .3s · flow Swiper (loop, slidesPerView auto, next button and dots).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("details").forEach((el) => {
    const summary = el.querySelector("summary");
    const panel = el.querySelectorAll(":scope > *:not(summary)");
    summary.addEventListener("click", (e) => {
      if (reduce) return;
      if (el.open) {
        e.preventDefault();
        gsap.to(panel, { height: 0, autoAlpha: 0, duration: 0.3, onComplete: () => { el.open = false; gsap.set(panel, { clearProps: "height" }); } });
      } else {
        gsap.fromTo(panel, { height: 0, autoAlpha: 0 }, { height: "auto", autoAlpha: 1, duration: 0.3 });
      }
    });
  });
  const flow = document.querySelector(".kp-flow");
  if (flow && window.Swiper) new Swiper(flow, { loop: true, loopAdditionalSlides: 1, slidesPerView: "auto", navigation: { nextEl: flow.querySelector(".kp-flow__next") }, pagination: { el: flow.querySelector(".kp-flow__dots"), clickable: true } });
})();
