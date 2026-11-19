// Home — two-column Swiper in the hero, copy and arrows, facility slider. Values are exactly the original scripts.js.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Facility slider — fade crossFade · speed 500 · 5s dwell · numbered pages
  new Swiper(".fg-fslider", {
    loop: true, speed: 500, effect: "fade", fadeEffect: { crossFade: true },
    autoplay: reduce ? false : { delay: 5000, disableOnInteraction: false },
    pagination: {
      el: ".fg-fslider__pagination", clickable: true, bulletClass: "fg-fslider__bullet", bulletActiveClass: "is-active",
      renderBullet: (i, cls) => `<span class="${cls}">${i + 1}</span>`,
    },
  });

  // Hero — when the curtain starts lifting the two cells start rotating together, and after .5s the copy clears from 30px blur at 1.2× in 3s,
  // 1.5s before the text ends the arrow rises from 25px below over 2.2s, and from .5s before the end it bobs up and down
  const hero = document.querySelector(".fg-hero");
  const slogan = hero.querySelector(".fg-hero__slogan"), indicator = hero.querySelector(".fg-hero__indicator");
  const swipers = [...hero.querySelectorAll(".fg-hero-swiper")].map((el) => {
    const s = new Swiper(el, {
      allowTouchMove: false, loop: true, speed: 2800, init: false, effect: "fade", fadeEffect: { crossFade: true },
      autoplay: { delay: 6000, disableOnInteraction: false },
    });
    s.on("init", () => s.autoplay.stop());
    s.init();
    return s;
  });
  const tl = gsap.timeline({ paused: true });
  if (reduce) {
    indicator.classList.add("is-move");
  } else {
    const sloganTl = gsap.timeline();
    gsap.set(slogan, { filter: "blur(30px)", opacity: 0, scale: 1.2 });
    sloganTl.to(slogan, { filter: "blur(0px)", opacity: 1, scale: 1, duration: 3, ease: "power4.out" });
    const arrowTl = gsap.timeline();
    gsap.set(indicator, { opacity: 0, y: 25 });
    arrowTl.to(indicator, { opacity: 1, y: 0, duration: 2.2, ease: "power4.out" });
    tl.call(() => swipers.forEach((s) => s.autoplay.start()));
    tl.add(sloganTl, "+=0.5");
    tl.add(arrowTl, "-=1.5");
    tl.call(() => indicator.classList.add("is-move"), [], "-=0.5");
  }
  window.fgOnOpen(() => tl.play());
})();
