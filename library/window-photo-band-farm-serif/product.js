// Products: original products.js — photo i blurs in from 16px → 0 from when the middle of the previous text (i-1) touches the screen top until its end touches,
// The front photo exits in reverse (scrub 1, ease none). Only at 769px and above. Stacking order is data-layer.
(() => {
  const root = document.querySelector(".js-features");
  const texts = [...root.querySelectorAll(".feature")];
  const imgs = [...root.querySelectorAll(".features-details__image")];
  imgs.forEach((im) => (im.style.zIndex = im.dataset.layer));

  // On phones, instead of a pinned image, each post gets its photo on top — the photo slot with the same label is cloned in
  texts.forEach((t, i) => {
    const ph = imgs[i].firstElementChild.cloneNode(true);
    ph.classList.add("feature__img");
    ph.style.cssText = "display:none;aspect-ratio:379/427;width:100%";
    t.parentElement.prepend(ph);
  });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference) and (min-width: 769px)", () => {
    imgs.forEach((im, i) => {
      if (i === 0) return;
      const st = { trigger: texts[i - 1].parentElement, start: "center top", end: "bottom top", scrub: 1 };
      gsap.fromTo(im, { opacity: 0, filter: "blur(16px)" }, { opacity: 1, filter: "blur(0px)", ease: "none", scrollTrigger: st });
      gsap.fromTo(imgs[i - 1], { opacity: 1, filter: "blur(0px)" }, { opacity: 0, filter: "blur(16px)", ease: "none", scrollTrigger: { ...st } });
    });
  });
})();
