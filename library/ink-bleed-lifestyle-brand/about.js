// About: two overlapping photo sets on a paper panel cross-fade every 5s over 1.5s (Splide fade, as in the original)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!window.Splide) return;
  document.querySelectorAll("[data-about-slider]").forEach((el) => {
    new Splide(el, { autoplay: !reduce, type: "fade", rewind: true, arrows: false, pagination: false, interval: 5000, speed: 1500, drag: false, pauseOnHover: false, pauseOnFocus: false }).mount();
  });
})();
