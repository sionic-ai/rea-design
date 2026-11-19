// Home: swiper fade slides (every 5s for 1.5s, loop, the visible slide and the one just left zoom 1.3→1 over 9s), staggered blur reveal of the three About cells,
// Parallax where photo frames float up at different heights (y 50 → -10×index, power2.out, scrub 1).
(() => {
  const { reduced } = KN;
  // Same swiper as the original: fade crossfade · 5s autoplay (does not wait for the transition) · 1.5s · loop · follow-finger off. Zoom is CSS (visible slide and slide just off the curtain 9s 1.3→1)
  new Swiper(".top-fv__swiper", { autoplay: reduced ? false : { delay: 5000, disableOnInteraction: false, waitForTransition: false }, effect: "fade", fadeEffect: { crossFade: true }, followFinger: false, loop: true, speed: 1500 });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference) and (min-width: 769px)", () => {
    [...document.querySelector(".js-top-intro-fade").children].forEach((el, i) => {
      gsap.fromTo(el, { x: -16, y: -16, opacity: 0, filter: "blur(10px)" }, { x: 0, y: 0, opacity: 1, filter: "blur(0px)", scrollTrigger: { trigger: el, start: `top ${90 - i * 10}%`, end: `center ${75 - i * 10}%`, scrub: 2 } });
    });
  });
  mm.add("(prefers-reduced-motion: no-preference) and (max-width: 768px)", () => KN.fadeBlur([...document.querySelector(".js-top-intro-fade").children]));
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll(".top-about-column__image, .top-products-image").forEach((img) => {
      gsap.fromTo(img, { y: 50 }, { y: -10 * img.dataset.index, ease: "power2.out", scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: 1 } });
    });
  });
})();
