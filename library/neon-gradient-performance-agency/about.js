// About — the path walked: while the photo sits in the 55%~45% band of the screen, that year’s text turns on in .45s power2.out (the rest stay off)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const D = reduce ? 0.01 : 0.45;
  const texts = {};
  document.querySelectorAll("[data-journey-text]").forEach((el) => { texts[el.dataset.journeyText] = el; gsap.set(el, { autoAlpha: 0 }); });
  document.querySelectorAll("[data-journey-image]").forEach((img) => {
    const text = texts[img.dataset.journeyImage];
    if (!text) return;
    ScrollTrigger.create({
      trigger: img, start: "top 55%", end: "bottom 45%",
      onToggle: (self) => { img.classList.toggle("is-in-view", self.isActive); gsap.to(text, { autoAlpha: self.isActive ? 1 : 0, duration: D, ease: "power2.out", overwrite: "auto" }); },
      onRefresh: (self) => { img.classList.toggle("is-in-view", self.isActive); gsap.set(text, { autoAlpha: self.isActive ? 1 : 0 }); },
    });
  });
})();
