/* About motion — original values: serif statement letters .01 spacing scrub .8 (top 80% → bottom 60%) · team swiper 8 (no autoplay, not center-aligned), the farther from center, the more cut off at the bottom, 20% (max 60%) */
(() => {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-what]").forEach((el) => {
      const s = new SplitText(el, { type: "words,chars", wordsClass: "lr-word" });
      gsap.from(s.chars, { opacity: 0, stagger: 0.01, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 60%", scrub: 0.8 } });
    });
  });
  const el = document.querySelector("[data-swiper]");
  if (el && window.Swiper) {
    new Swiper(el, { slidesPerView: "auto", watchSlidesProgress: true, followFinger: false, threshold: 8, speed: 600, mousewheel: { enabled: true, forceToAxis: true }, keyboard: { enabled: true, onlyInViewport: true } });
  }
})();
