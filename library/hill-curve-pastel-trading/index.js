// Home: hero curve opening and photo fade (Swiper), pinned About background (Swiper photo + color-burn video), strengths horizontal pinned scroll, popular products Swiper.
(() => {
  const { reduce } = window.FT;
  const header = document.querySelector(".ft-header");
  header.classList.add("is-intro");

  /* Hero: only on the first visit the curve opens after 2 seconds (1.2s) and the slider starts after 2.5 seconds. On return it is already open */
  const kv = document.querySelector(".hm-kv");
  // Original kvSlider: Swiper fade · speed 700 · loop · autoplay 4000 (the timer starts after the transition ends)
  const startKV = () => new Swiper(".hm-kv__swiper", {
    effect: "fade", speed: 700, loop: true, a11y: window.FT.a11y, autoplay: reduce ? false : { delay: 4000, disableOnInteraction: false },
  });
  if (reduce || sessionStorage.getItem("ft-visited")) { kv.classList.add("is-active"); startKV(); }
  else { kv.classList.add("is-loading"); sessionStorage.setItem("ft-visited", "1"); setTimeout(startKV, 2500); }

  /* About: while the area spans the lower half of the screen a deep gradient shows, and while the inner body spans it a pastel shows (1 second fade) */
  const about = document.querySelector(".hm-about");
  const inner = about.querySelector(".hm-about__inner");
  about.insertAdjacentHTML("afterbegin", window.FT.pastelLayer(false, true));
  const pastel = about.querySelector(".ft-pastel");
  window.FT.cyclePastel(pastel);
  const half = { rootMargin: "-50% 0% 0% 0%" };
  new IntersectionObserver(([e]) => about.classList.toggle("is-on", e.isIntersecting), half).observe(about);
  new IntersectionObserver(([e]) => pastel.classList.toggle("is-on", e.isIntersecting), half).observe(inner);

  /* Popular products: original mvSwiper — auto width · 1s · loop · 3 seconds · centered on phones only (centeredSlides off at 768 and up), no sliding with a single slide */
  const hot = document.querySelector(".hm-hot__slider");
  if (hot.querySelectorAll(".swiper-slide").length === 1) new Swiper(hot, { loop: false, allowTouchMove: false, a11y: window.FT.a11y });
  else new Swiper(hot, {
    slidesPerView: "auto", speed: 1000, centeredSlides: true, loop: true, a11y: window.FT.a11y,
    autoplay: reduce ? false : { delay: 3000, disableOnInteraction: false },
    navigation: { prevEl: ".hm-hot__prev", nextEl: ".hm-hot__next" },
    breakpoints: { 768: { centeredSlides: false } },
  });

  /* Strengths: pinned when the wrapper reaches the vertical center of the screen, then the card row slides sideways to the end over 1000px (scrub 1) */
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const list = document.querySelector(".hm-feature__list");
    const wrap = document.querySelector(".hm-feature__wrap");
    const heading = document.querySelector(".hm-feature__heading");
    const ctn = document.querySelector(".hm-feature__ctn");
    const dist = () => {
      const pad = parseFloat(getComputedStyle(ctn).paddingLeft) || 0;
      let n = 224;
      if (innerWidth < 1366) n = (224 / 1365) * innerWidth;
      if (innerWidth < 768) n = (283 / 768) * innerWidth;
      const c = (innerWidth - heading.clientWidth) / 2 + n;
      return -(list.getBoundingClientRect().width - innerWidth + pad + c);
    };
    const top = () => (innerWidth > 767 ? (innerHeight - wrap.clientHeight) / 2 : 0);
    gsap.to(list, {
      x: dist, ease: "none",
      scrollTrigger: { trigger: ".hm-feature", pin: ".hm-feature", scrub: 1, start: () => `top-=${top()} top`, end: "+=1000", invalidateOnRefresh: true },
    });
  });

  window.FT.initPara();
  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
