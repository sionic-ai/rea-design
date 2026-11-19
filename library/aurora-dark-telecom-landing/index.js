// First page: hero thumbnail slider (original l-swiper, centered · loop · 300ms) + large background cross-fade, member perks slider, and a fixed table of contents that lights up following the current section
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gap = (el) => parseFloat(getComputedStyle(el).getPropertyValue("--_gap")) || 24;

  if (window.Swiper) {
    const bgs = [...document.querySelectorAll(".hx__bgimg")];
    const hero = document.querySelector(".hx__thumbs .swiper");
    if (hero) {
      const sw = new Swiper(hero, {
        slidesPerView: "auto", centeredSlides: true, loop: true, speed: 300, spaceBetween: 16,
        autoplay: reduce ? false : { delay: 5000, disableOnInteraction: false },
        navigation: { prevEl: ".hx__prev", nextEl: ".hx__next" },
        pagination: { el: ".hx__pager", clickable: true },
        slideToClickedSlide: true,
        on: { realIndexChange: (s) => bgs.forEach((b, i) => b.classList.toggle("is-on", i === s.realIndex)) },
      });
      const pause = document.querySelector(".hx__pause");
      pause?.addEventListener("click", () => {
        const run = sw.autoplay.running && !sw.autoplay.paused;
        if (run) sw.autoplay.stop(); else sw.autoplay.start();
        pause.setAttribute("aria-label", run ? "Play Auto-Advance" : "Pause Auto-Advance");
        pause.innerHTML = window.nrIcon(run ? "play" : "pause");
      });
    }
    const ev = document.querySelector(".ev .swiper");
    if (ev) new Swiper(ev, {
      slidesPerView: "auto", centeredSlides: true, loop: true, speed: 300, spaceBetween: gap(ev),
      navigation: { prevEl: ".ev__prev", nextEl: ".ev__next" },
      pagination: { el: ".ev__pager", clickable: true },
    });
  }

  // Original l-sticky: when the section top passes the screen center, its table of contents turns on (top 50% ~ bottom 50%)
  const links = [...document.querySelectorAll(".mx__nav a")];
  const bar = document.querySelector(".mx__spbar");
  if (window.gsap && window.ScrollTrigger && links.length) {
    gsap.registerPlugin(ScrollTrigger);
    links.forEach((a) => {
      const sec = document.querySelector(a.getAttribute("href"));
      if (!sec) return;
      ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%", onToggle: (st) => {
        if (!st.isActive) return;
        links.forEach((l) => l.classList.toggle("is-on", l === a));
        if (bar) bar.textContent = a.textContent;
      } });
    });
  }
})();
