// Home page — hero sequence once the loader clears (intro text → two photos → handwritten line → surrounding pieces), entry tilt slider.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const intro = document.querySelectorAll(".sg-hero__intro > *");
  const photos = document.querySelectorAll(".sg-hero__boy-photo, .sg-hero__girl-photo");
  const charas = Array.from(document.querySelectorAll(".sg-hero__chara"));
  const floats = document.querySelectorAll(".sg-hero__float");
  const play = (els) => els.forEach((el) => el.dispatchEvent(new Event("fx:play")));

  function heroIn() {
    if (reduce) { gsap.set([intro, charas], { opacity: 1 }); play(photos); play(floats); return; }
    const first = charas.slice(0, 7), second = charas.slice(7);
    // Original values exactly: text after .5s, 1s power3.out .1s apart → photo −.4 → first line of copy .05s apart → second line −.2 → piece −.3
    gsap.timeline()
      .set(charas, { scale: 0.1, opacity: 0 })
      .set(intro, { y: 20, opacity: 0 })
      .to(intro, { y: 0, opacity: 1, duration: 1, stagger: 0.1, delay: 0.5, ease: "power3.out" })
      .call(() => play(photos), null, "-=0.4")
      .to(first, { scale: 1, opacity: 1, duration: 0.6, stagger: 0.05, ease: "back.out" }, "<0.7")
      .to(second, { scale: 1, opacity: 1, duration: 0.6, stagger: 0.05, ease: "back.out" }, "-=0.2")
      .call(() => play(floats), null, "-=0.3");
  }
  addEventListener("sg:loaded", heroIn, { once: true });

  // Entry slider — original swiper settings as is, flipping the tilt direction depending on whether the current slide is even or odd
  const el = document.querySelector(".sg-award__swiper");
  if (el && window.Swiper) {
    const tilt = (s) => s.el.classList.toggle("is-tilt-alt", s.realIndex % 2 === 1);
    new Swiper(el, {
      loop: true,
      loopPreventsSliding: false,
      slidesPerView: 1.5,
      spaceBetween: 30,
      centeredSlides: true,
      speed: 450,
      autoplay: reduce ? false : { delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true },
      navigation: { prevEl: ".sg-award__nav-btn.is-prev", nextEl: ".sg-award__nav-btn.is-next" },
      breakpoints: { 481: { slidesPerView: 2.5 }, 821: { slidesPerView: 3.5, spaceBetween: 40 } },
      on: { init: tilt, slideChangeTransitionStart: tilt },
    });
  }
})();
