// First section — two hero photo panels (Swiper auto-advancing in reverse, at different tempos), a journal row swiped on phones only, list staggered entrance
document.addEventListener("sz:ready", () => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let left, right;
  const heroSwipers = () => {
    left && left.destroy(true, true);
    right && right.destroy(true, true);
    const base = { slidesPerView: 1, loop: true, allowTouchMove: false, touchStartPreventDefault: false };
    left = new Swiper(".swiper-panel--left", { ...base, speed: 800, autoplay: reduce ? false : { delay: 3800, disableOnInteraction: false, reverseDirection: true } });
    right = new Swiper(".swiper-panel--right", { ...base, speed: 400, autoplay: reduce ? false : { delay: 4200, disableOnInteraction: false, reverseDirection: true } });
    // Only the left panel starts 120ms late so the two panels don’t flip on the same beat (as in the original)
    if (!reduce) { left.autoplay.stop(); setTimeout(() => left.autoplay.start(), 120); }
  };
  heroSwipers();
  let w = innerWidth, t;
  addEventListener("resize", () => {
    if (innerWidth === w) return;
    w = innerWidth;
    clearTimeout(t);
    t = setTimeout(() => { heroSwipers(); ScrollTrigger.refresh(); }, 300);
  });

  // Three journal sections — a row that advances 1.2 at a time only below 600px (2px bar underneath)
  const mqXs = matchMedia("(min-width: 600px)");
  let journal = null;
  const journalSwiper = (e) => {
    if (e.matches) { journal && (journal.destroy(true, true), (journal = null)); }
    else if (!journal) journal = new Swiper("#sz-journal-slider", { slidesPerView: 1.2, speed: 300, scrollbar: { el: ".swiper-scrollbar", hide: false } });
  };
  journalSwiper(mqXs);
  mqXs.addEventListener("change", journalSwiper);

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.set(".c-journal-list__item", { opacity: 0, y: 30 });
    gsap.to(".c-journal-list__item", { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.12, scrollTrigger: { trigger: ".c-journal-list", start: "top 70%", once: true } });
    gsap.set(".c-news-list .c-news-list__item", { opacity: 0, y: 30 });
    gsap.to(".c-news-list .c-news-list__item", { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.15, scrollTrigger: { trigger: ".c-news-list", start: "top 70%", once: true } });
  });
});
