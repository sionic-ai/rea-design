// Case detail — scales the big name to fit within 80%·70% of the screen, raises it from below 100% over 2s ”cubic”, and the background photo has 1.1x parallax.
// The screen row is the same Swiper as the original (3.5 slides · 5% gap · drag · jump to the pressed slide)
(() => {
  const title = document.getElementById("project-title"), media = document.getElementById("hero-media");
  if (media && window.D?.parallax) window.D.parallax(media);
  if (title && window.gsap) {
    const fit = () => {
      title.style.scale = "1";
      const r = title.getBoundingClientRect();
      title.style.scale = String(Math.max(Math.min((innerWidth * 0.8) / r.width, (innerHeight * 0.7) / r.height), 1));
    };
    fit();
    addEventListener("resize", fit);
    if (window.D?.reduce) gsap.set(title, { yPercent: 0 });
    else gsap.fromTo(title, { yPercent: 100 }, { yPercent: 0, duration: 2, ease: "cubic" });
  }
  document.querySelectorAll(".d-swiper").forEach((el) => {
    if (!window.Swiper) return;
    new Swiper(el, {
      direction: "horizontal", slidesPerGroup: 1, slidesPerView: parseFloat(el.dataset.slideCount) || 1.5,
      centeredSlides: false, spaceBetween: el.dataset.spacing || "10%", grabCursor: true, slideToClickedSlide: true,
    });
  });
})();
