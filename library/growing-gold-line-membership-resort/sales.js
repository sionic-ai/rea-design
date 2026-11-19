// Sales first page — Swiper 8.4.7 fade hero (loop · crossFade · 5s autoplay · diamond progress), photo swapping for the pinned copy, hiding the two bottom buttons
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const slider = document.querySelector(".hs-kv__slider");
  if (slider && window.Swiper) {
    root.style.setProperty("--kv-diamond-duration", String(2.5 + 0.1));
    new Swiper(slider, {
      loop: true,
      effect: "fade",
      threshold: 10,
      fadeEffect: { crossFade: true },
      autoplay: reduce ? false : { delay: 5000, disableOnInteraction: false },
      pagination: {
        el: slider.querySelector(".hs-kv__dots"),
        clickable: true,
        renderBullet: (i, cls) => `<span class="${cls}"><span></span></span>`,
      },
      navigation: { prevEl: slider.querySelector(".hs-kv__prev"), nextEl: slider.querySelector(".hs-kv__next") },
      on: { init: (sw) => sw.el.classList.add("is-init") },
    });
  }

  // Pinned copy — when the second line passes the screen center, the second photo and second diamond turn on
  const items = document.querySelectorAll(".hs-statement__item"), dias = document.querySelectorAll(".hs-statement__dias i"), contents = document.querySelectorAll(".hs-statement__content");
  const pick = () => {
    let n = 0;
    contents.forEach((c, i) => { if (c.getBoundingClientRect().top < innerHeight / 2) n = i; });
    items.forEach((el, i) => el.classList.toggle("is-active", i === n || i === 0));
    dias.forEach((el, i) => el.classList.toggle("is-active", i === n));
  };

  // Two bottom buttons — hidden while scrolling down, shown when scrolling up
  const bar = document.querySelector(".hs-bottom__bar");
  let last = scrollY;
  const onScroll = () => {
    pick();
    if (bar) { const y = scrollY; bar.classList.toggle("is-down", y > last && y > 100); last = y; }
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
