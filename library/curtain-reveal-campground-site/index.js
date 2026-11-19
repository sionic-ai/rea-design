// First page — with the same Swiper 8 settings as the original, runs the Hero photo pair, flowing photo strip, footer slogan and phone spots row
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const kv = document.getElementById("kv");

  // The original fixes the hero height to the window height (px) and re-measures on window change only on mouse devices (so phone address bars don’t shake it)
  const fit = () => { kv.style.height = `${innerHeight}px`; };
  fit();
  if (matchMedia("(hover)").matches) addEventListener("resize", fit);

  // Photo pair — fade speed is 0 so the slide swaps instantly, and the visible motion is the clip-path transition of .current (css)
  const kvSlider = new Swiper("#kv-slider", {
    speed: 0,
    loop: true,
    slidesPerView: 1,
    centeredSlides: true,
    effect: "fade",
    allowTouchMove: false,
    loopAdditionalSlides: 1,
    autoplay: { delay: 6000, disableOnInteraction: false },
  });
  kvSlider.on("slideChange", () => {
    const slides = kvSlider.el.querySelectorAll(".swiper-slide");
    const real = kvSlider.realIndex;
    slides.forEach((s) => s.classList.toggle("current", +s.getAttribute("data-swiper-slide-index") === real));
  });
  kvSlider.autoplay.stop();

  // Flowing strip — at delay 0 one item takes 20s (photos) · 60s (slogans) linear
  const flows = [
    ...[...document.querySelectorAll(".loop-slider")].map((el) => new Swiper(el, { speed: 20000, loop: true, slidesPerView: "auto", allowTouchMove: false, autoplay: { delay: 0 } })),
    new Swiper("#loop-txt", { speed: 60000, loop: true, slidesPerView: "auto", allowTouchMove: false, autoplay: { delay: 0 } }),
  ];
  if (reduce) flows.forEach((s) => s.autoplay.stop());

  // Only on phone are the attraction rows drag-swiped (freeMode + progress bar). On PC it is a four-cell row
  const narrow = matchMedia("(max-width: 768px)");
  const spots = ["#explore-slider1", "#explore-slider2"].map((sel) => ({ el: document.querySelector(sel), sw: null }));
  const syncSpots = () => spots.forEach((s) => {
    if (narrow.matches && !s.sw) s.sw = new Swiper(s.el, { slidesPerView: "auto", freeMode: true, pagination: { el: s.el.querySelector(".swiper-pagination"), type: "progressbar" } });
    else if (!narrow.matches && s.sw) { s.sw.destroy(false, true); s.sw = null; }
  });
  addEventListener("load", syncSpots);
  narrow.addEventListener("change", syncSpots);

  document.querySelectorAll(".y-question .question dt").forEach((dt) => dt.addEventListener("click", () => dt.parentElement.classList.toggle("is-open")));

  // First turn-on — curtain 0 · auto advance .3s · wordmark .9s · vertical copy 1.2s (header .6s·reservation circle 1.5s are in shared.js)
  const mask = kv.querySelector(".y-kv__mask"), copy = kv.querySelector(".y-kv__copy"), lead = kv.querySelector(".y-kv__lead");
  addEventListener("load", () => {
    if (reduce) { [mask, copy, lead].forEach((el) => el.classList.add("is-show")); return; }
    mask.classList.add("is-show");
    setTimeout(() => kvSlider.autoplay.start(), 300);
    setTimeout(() => copy.classList.add("is-show"), 900);
    setTimeout(() => lead.classList.add("is-show"), 1200);
  });
})();
